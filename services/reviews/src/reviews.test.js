import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "./index.js";

const jwtSecret = "test-secret";

test("health endpoint works behind direct and prefixed ingress paths", async () => {
  const app = await buildApp({ jwtSecret, logger: false });
  test.after(async () => app.close());

  const direct = await app.inject({ method: "GET", url: "/health" });
  assert.equal(direct.statusCode, 200);
  assert.deepEqual(direct.json(), { service: "reviews", status: "ok" });

  const prefixed = await app.inject({ method: "GET", url: "/reviews/health" });
  assert.equal(prefixed.statusCode, 200);
  assert.deepEqual(prefixed.json(), { service: "reviews", status: "ok" });
});

test("review creation falls back to neutral sentiment when Samarth service is unavailable", async () => {
  const app = await buildApp({
    jwtSecret,
    logger: false,
    sentimentUrl: "http://127.0.0.1:1/sentiment",
  });
  test.after(async () => app.close());

  const token = app.jwt.sign({
    id: "user-1",
    name: "Venkata",
    email: "venkata@example.com",
    role: "user",
  });

  const created = await app.inject({
    method: "POST",
    url: "/reviews/car-1",
    headers: { authorization: `Bearer ${token}` },
    payload: { rating: 5, comment: "Great car and smooth ride" },
  });

  assert.equal(created.statusCode, 201);
  assert.equal(created.json().sentiment, "neutral");

  const list = await app.inject({ method: "GET", url: "/reviews/car-1" });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().total, 1);
  assert.equal(list.json().average_rating, 5);
});
