import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

const JWT_SECRET = process.env.JWT_SECRET ?? "autodrive-dev-secret-change-in-prod";
const DATABASE_URL =
  process.env.AUTH_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/autodrive";
const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL ?? "http://localhost:4001";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const AUTH_USE_INMEMORY = process.env.AUTH_USE_INMEMORY === "true";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? `${OAUTH_BASE_URL}/oauth/google/callback`;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL ?? `${OAUTH_BASE_URL}/oauth/github/callback`;

const pool = AUTH_USE_INMEMORY ? null : new Pool({ connectionString: DATABASE_URL });
const memoryUsers = new Map();

async function ensureSchema() {
  if (AUTH_USE_INMEMORY) return;
  let attempts = 0;
  while (attempts < 20) {
    try {
      await pool.query("SELECT 1");
      break;
    } catch (error) {
      attempts += 1;
      if (attempts >= 20) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      provider TEXT NOT NULL DEFAULT 'local',
      provider_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'local'");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id TEXT");
}

function sanitizeUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role ?? "user" };
}

function signToken(app, user) {
  return app.jwt.sign(sanitizeUser(user), { expiresIn: "7d" });
}

async function exchangeOAuthToken(url, body, useBasicAuth = false) {
  const headers = { Accept: "application/json" };
  let payload;
  if (useBasicAuth) {
    const basic = Buffer.from(`${body.client_id}:${body.client_secret}`).toString("base64");
    headers.Authorization = `Basic ${basic}`;
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams({ code: body.code, redirect_uri: body.redirect_uri });
  } else {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(url, { method: "POST", headers, body: payload });
  if (!res.ok) throw new Error(`OAuth token exchange failed with status ${res.status}`);
  return res.json();
}

async function upsertOAuthUser({ provider, providerId, name, email }) {
  if (AUTH_USE_INMEMORY) {
    const existing = [...memoryUsers.values()].find(
      (u) => u.provider === provider && u.provider_id === providerId,
    );
    if (existing) return existing;
    const byEmail = memoryUsers.get(email.toLowerCase());
    if (byEmail) {
      byEmail.provider = provider;
      byEmail.provider_id = providerId;
      return byEmail;
    }
    const user = { id: randomUUID(), name, email, role: "user", provider, provider_id: providerId };
    memoryUsers.set(email.toLowerCase(), user);
    return user;
  }

  const existing = await pool.query(
    "SELECT id, name, email, role FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1",
    [provider, providerId],
  );
  if (existing.rows[0]) return existing.rows[0];

  const byEmail = await pool.query(
    "SELECT id, name, email, role FROM users WHERE lower(email) = lower($1) LIMIT 1",
    [email],
  );
  if (byEmail.rows[0]) {
    const updated = await pool.query(
      "UPDATE users SET provider = $1, provider_id = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role",
      [provider, providerId, byEmail.rows[0].id],
    );
    return updated.rows[0];
  }

  const inserted = await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, provider, provider_id)
     VALUES ($1, $2, lower($3), NULL, 'user', $4, $5)
     RETURNING id, name, email, role`,
    [randomUUID(), name, email, provider, providerId],
  );
  return inserted.rows[0];
}

export async function buildApp() {
  await ensureSchema();
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: "*" });
  await app.register(jwt, { secret: JWT_SECRET });

  app.decorate("authenticate", async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  const healthHandler = async () => ({ service: "auth", status: "ok" });
  app.get("/health", healthHandler);
  app.get("/auth/health", healthHandler);

  const registerHandler = async (req, reply) => {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password) return reply.code(400).send({ error: "name, email, and password are required" });
    const hash = await bcrypt.hash(password, 10);
    const resolvedRole = role === "admin" ? "admin" : "user";
    try {
      let user;
      if (AUTH_USE_INMEMORY) {
        if (memoryUsers.has(email.toLowerCase())) return reply.code(409).send({ error: "Email already registered" });
        user = { id: randomUUID(), name, email: email.toLowerCase(), role: resolvedRole, password_hash: hash, provider: "local" };
        memoryUsers.set(user.email, user);
      } else {
        const result = await pool.query(
          `INSERT INTO users (id, name, email, password_hash, role, provider)
           VALUES ($1, $2, lower($3), $4, $5, 'local')
           RETURNING id, name, email, role`,
          [randomUUID(), name, email, hash, resolvedRole],
        );
        user = result.rows[0];
      }
      return reply.code(201).send({ token: signToken(app, user), user: sanitizeUser(user) });
    } catch (error) {
      if (error?.code === "23505") return reply.code(409).send({ error: "Email already registered" });
      req.log.error(error);
      return reply.code(500).send({ error: "Failed to register user" });
    }
  };
  app.post("/register", registerHandler);
  app.post("/auth/register", registerHandler);

  const loginHandler = async (req, reply) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return reply.code(400).send({ error: "email and password are required" });
    const user = AUTH_USE_INMEMORY
      ? memoryUsers.get(email.toLowerCase())
      : (await pool.query("SELECT id, name, email, role, password_hash FROM users WHERE lower(email)=lower($1) LIMIT 1", [email])).rows[0];
    if (!user?.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }
    return { token: signToken(app, user), user: sanitizeUser(user) };
  };
  app.post("/login", loginHandler);
  app.post("/auth/login", loginHandler);

  app.get("/me", { preHandler: [app.authenticate] }, async (req) => ({ user: req.user }));
  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => req.user);
  app.post("/logout", { preHandler: [app.authenticate] }, async () => ({ message: "logged out" }));
  app.post("/auth/logout", { preHandler: [app.authenticate] }, async () => ({ message: "logged out" }));
  app.post("/refresh", { preHandler: [app.authenticate] }, async (req) => ({ token: signToken(app, req.user), user: req.user }));
  app.post("/auth/refresh", { preHandler: [app.authenticate] }, async (req) => ({ token: signToken(app, req.user), user: req.user }));

  const googleStartHandler = async (_req, reply) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return reply.code(400).send({ error: "Google OAuth keys are not configured" });
    const redirect = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    redirect.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    redirect.searchParams.set("redirect_uri", GOOGLE_CALLBACK_URL);
    redirect.searchParams.set("response_type", "code");
    redirect.searchParams.set("scope", "openid email profile");
    redirect.searchParams.set("prompt", "select_account");
    return reply.send({ authUrl: redirect.toString() });
  };
  app.get("/oauth/google/start", googleStartHandler);
  app.get("/auth/google", googleStartHandler);

  const googleCallbackHandler = async (req, reply) => {
    const code = req.query?.code;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return reply.code(400).send({ error: "Google OAuth keys are not configured" });
    if (!code) return reply.code(400).send({ error: "Missing authorization code" });
    try {
      const tokenResponse = await exchangeOAuthToken("https://oauth2.googleapis.com/token", {
        client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, code, grant_type: "authorization_code", redirect_uri: GOOGLE_CALLBACK_URL,
      });
      const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } });
      const profile = await profileRes.json();
      const user = await upsertOAuthUser({ provider: "google", providerId: profile.sub, name: profile.name ?? profile.email?.split("@")[0] ?? "Google User", email: profile.email });
      const token = signToken(app, user);
      const callbackUrl = new URL(`${FRONTEND_URL}/login`);
      callbackUrl.searchParams.set("token", token);
      callbackUrl.searchParams.set("id", user.id);
      callbackUrl.searchParams.set("name", user.name);
      callbackUrl.searchParams.set("email", user.email);
      callbackUrl.searchParams.set("role", user.role);
      return reply.redirect(callbackUrl.toString());
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ error: "Google OAuth login failed" });
    }
  };
  app.get("/oauth/google/callback", googleCallbackHandler);
  app.get("/auth/google/callback", googleCallbackHandler);

  const githubStartHandler = async (_req, reply) => {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) return reply.code(400).send({ error: "GitHub OAuth keys are not configured" });
    const redirect = new URL("https://github.com/login/oauth/authorize");
    redirect.searchParams.set("client_id", GITHUB_CLIENT_ID);
    redirect.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
    redirect.searchParams.set("scope", "read:user user:email");
    return reply.send({ authUrl: redirect.toString() });
  };
  app.get("/oauth/github/start", githubStartHandler);
  app.get("/auth/github", githubStartHandler);

  const githubCallbackHandler = async (req, reply) => {
    const code = req.query?.code;
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) return reply.code(400).send({ error: "GitHub OAuth keys are not configured" });
    if (!code) return reply.code(400).send({ error: "Missing authorization code" });
    try {
      const tokenResponse = await exchangeOAuthToken("https://github.com/login/oauth/access_token", {
        client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, redirect_uri: GITHUB_CALLBACK_URL,
      }, true);
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}`, "User-Agent": "autodrive-auth-service", Accept: "application/vnd.github+json" },
      });
      const ghUser = await userRes.json();
      let email = ghUser.email;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}`, "User-Agent": "autodrive-auth-service", Accept: "application/vnd.github+json" },
        });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          email = emails.find((e) => e.primary)?.email ?? emails[0]?.email;
        }
      }
      if (!email) return reply.code(400).send({ error: "GitHub account has no public/primary email" });
      const user = await upsertOAuthUser({ provider: "github", providerId: String(ghUser.id), name: ghUser.name ?? ghUser.login ?? "GitHub User", email });
      const token = signToken(app, user);
      const callbackUrl = new URL(`${FRONTEND_URL}/login`);
      callbackUrl.searchParams.set("token", token);
      callbackUrl.searchParams.set("id", user.id);
      callbackUrl.searchParams.set("name", user.name);
      callbackUrl.searchParams.set("email", user.email);
      callbackUrl.searchParams.set("role", user.role);
      return reply.redirect(callbackUrl.toString());
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ error: "GitHub OAuth login failed" });
    }
  };
  app.get("/oauth/github/callback", githubCallbackHandler);
  app.get("/auth/github/callback", githubCallbackHandler);

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const app = await buildApp();
  app.listen({ port: Number(process.env.PORT ?? 4001), host: "0.0.0.0" }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}
