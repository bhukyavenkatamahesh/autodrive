import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
process.env.AUTH_USE_INMEMORY = "true";

const { buildApp } = await import("./index.js");

test("register and login returns role in user payload", async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  const registerRes = await app.inject({
    method: "POST",
    url: "/register",
    payload: { name: "Admin", email: "admin@autodrive.dev", password: "secret123", role: "admin" },
  });
  assert.equal(registerRes.statusCode, 201);
  const registerBody = registerRes.json();
  assert.equal(registerBody.user.role, "admin");
  assert.ok(registerBody.token);

  const loginRes = await app.inject({
    method: "POST",
    url: "/login",
    payload: { email: "admin@autodrive.dev", password: "secret123" },
  });
  assert.equal(loginRes.statusCode, 200);
  const loginBody = loginRes.json();
  assert.equal(loginBody.user.role, "admin");
  assert.ok(loginBody.token);
});

test("login fails for bad password", async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  await app.inject({
    method: "POST",
    url: "/register",
    payload: { name: "User", email: "user@autodrive.dev", password: "secret123" },
  });

  const loginRes = await app.inject({
    method: "POST",
    url: "/login",
    payload: { email: "user@autodrive.dev", password: "wrong" },
  });

  assert.equal(loginRes.statusCode, 401);
});
