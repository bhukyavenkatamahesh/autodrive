import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";

const app = Fastify({ logger: true });

// ── Plugins ────────────────────────────────────────────────────────────────
await app.register(cors, { origin: "*" });

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "autodrive-dev-secret-change-in-prod",
  sign: { expiresIn: "7d" },
});

// ── Auth decorator (used as preHandler on protected routes) ────────────────
app.decorate("authenticate", async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// ── In-memory stores ───────────────────────────────────────────────────────
// NOTE: data resets on restart — replace with Postgres (users) + Redis (revoked
// tokens) for production. The schemas here mirror guide §2.1.
const users = new Map();          // email → user object
const revokedTokens = new Set();  // JWT ids (jti) or raw tokens we've invalidated

function signToken(user) {
  return app.jwt.sign({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role ?? "user" };
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/health", async () => ({ service: "auth", status: "ok" }));

/**
 * POST /register
 * Body: { name, email, password }
 * Returns: { token, user: { id, name, email, role } }
 */
app.post("/register", async (req, reply) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return reply.code(400).send({ error: "name, email, and password are required" });
  }
  if (password.length < 6) {
    return reply.code(400).send({ error: "Password must be at least 6 characters" });
  }
  if (users.has(email)) {
    return reply.code(409).send({ error: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: String(Date.now()),
    name,
    email,
    password: hash,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  users.set(email, user);

  const token = signToken(user);
  return reply.code(201).send({ token, user: publicUser(user) });
});

/**
 * POST /login
 * Body: { email, password }
 * Returns: { token, user: { id, name, email, role } }
 */
app.post("/login", async (req, reply) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return reply.code(400).send({ error: "email and password are required" });
  }

  const user = users.get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.code(401).send({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  return { token, user: publicUser(user) };
});

/**
 * GET /me  (protected)
 * Returns: { user }
 */
app.get("/me", { preHandler: [app.authenticate] }, async (req, reply) => {
  const authHeader = req.headers.authorization ?? "";
  const rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (rawToken && revokedTokens.has(rawToken)) {
    return reply.code(401).send({ error: "Token revoked" });
  }
  return { user: req.user };
});

/**
 * POST /logout  (protected)
 * Adds the presented token to the revocation set so /me stops accepting it.
 * JWTs are stateless, so a client-side discard is usually enough — this is
 * the server-side belt-and-braces for sensitive deployments.
 */
app.post("/logout", { preHandler: [app.authenticate] }, async (req) => {
  const authHeader = req.headers.authorization ?? "";
  if (authHeader.startsWith("Bearer ")) {
    revokedTokens.add(authHeader.slice(7));
  }
  return { message: "logged out" };
});

/**
 * POST /refresh  (protected)
 * Issues a new 7-day token from a currently-valid one.
 */
app.post("/refresh", { preHandler: [app.authenticate] }, async (req, reply) => {
  const { id, name, email, role } = req.user ?? {};
  const user = users.get(email);
  if (!user) return reply.code(401).send({ error: "User no longer exists" });

  const token = signToken({ id, name, email, role: role ?? "user" });
  return { token, user: publicUser(user) };
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 4001);
app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
