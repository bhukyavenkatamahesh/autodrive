import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";

const app = Fastify({ logger: true });

// ── Plugins ────────────────────────────────────────────────────────────────
await app.register(cors, { origin: "*" });

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "autodrive-dev-secret-change-in-prod",
});

// ── Auth decorator (used as preHandler on protected routes) ────────────────
app.decorate("authenticate", async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// ── In-memory user store: email → user object ──────────────────────────────
// NOTE: data resets on restart — replace with a real DB (e.g. Postgres) later
const users = new Map();

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/health", async () => ({ service: "auth", status: "ok" }));

/**
 * POST /register
 * Body: { name, email, password }
 * Returns: { token, user: { id, name, email } }
 */
app.post("/register", async (req, reply) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return reply.code(400).send({ error: "name, email, and password are required" });
  }

  if (users.has(email)) {
    return reply.code(409).send({ error: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = { id: String(Date.now()), name, email, password: hash };
  users.set(email, user);

  const token = app.jwt.sign({ id: user.id, name, email });
  return reply.code(201).send({ token, user: { id: user.id, name, email } });
});

/**
 * POST /login
 * Body: { email, password }
 * Returns: { token, user: { id, name, email } }
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

  const token = app.jwt.sign({ id: user.id, name: user.name, email });
  return { token, user: { id: user.id, name: user.name, email } };
});

/**
 * GET /me  (protected — requires Authorization: Bearer <token>)
 * Returns: { user: { id, name, email } }
 */
app.get("/me", { preHandler: [app.authenticate] }, async (req) => ({
  user: req.user,
}));

// ── Start ──────────────────────────────────────────────────────────────────
app.listen({ port: 4001, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
