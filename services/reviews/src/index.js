import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

const app = Fastify({ logger: true });

// ── Plugins ────────────────────────────────────────────────────────────────
await app.register(cors, { origin: "*" });
await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "autodrive-dev-secret-change-in-prod",
});

app.decorate("authenticate", async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// ── Config ─────────────────────────────────────────────────────────────────
const SENTIMENT_URL = process.env.SENTIMENT_API_URL ?? "http://localhost:7071/api/sentiment";

// ── In-memory store: array of review objects ──────────────────────────────
// Shape: { id, car_id, user, rating, comment, sentiment, sentiment_score, created_at }
const reviews = [];

function publicReview(r) {
  return {
    id: r.id,
    car_id: r.car_id,
    user: r.user,
    rating: r.rating,
    comment: r.comment,
    sentiment: r.sentiment,
    sentiment_score: r.sentiment_score,
    created_at: r.created_at,
  };
}

/**
 * Fetch sentiment from Samarth's sentiment service.
 * Fails gracefully: if the service is down or slow, return a neutral default
 * so the review itself still gets created.
 */
async function analyzeSentiment(text) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(SENTIMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`sentiment service returned ${res.status}`);
    const data = await res.json();
    return {
      label: (data.label ?? "neutral").toLowerCase(),
      score: typeof data.score === "number" ? data.score : 0.5,
    };
  } catch (err) {
    app.log.warn({ err: err.message }, "sentiment unavailable — using neutral default");
    return { label: "neutral", score: 0.5 };
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/health", async () => ({ service: "reviews", status: "ok" }));

/**
 * GET /reviews/:car_id
 * Returns: { reviews: [...], average_rating, total }
 */
app.get("/reviews/:car_id", async (req) => {
  const { car_id } = req.params;
  const list = reviews
    .filter((r) => r.car_id === car_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const total = list.length;
  const avg = total === 0
    ? 0
    : Math.round((list.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10;
  return {
    reviews: list.map(publicReview),
    average_rating: avg,
    total,
  };
});

/**
 * POST /reviews/:car_id  (protected)
 * Body: { rating (1-5), comment }
 */
app.post(
  "/reviews/:car_id",
  { preHandler: [app.authenticate] },
  async (req, reply) => {
    const { car_id } = req.params;
    const { rating, comment } = req.body ?? {};

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: "rating must be an integer 1–5" });
    }
    if (typeof comment !== "string" || comment.trim().length < 3) {
      return reply.code(400).send({ error: "comment must be at least 3 characters" });
    }

    const { label, score } = await analyzeSentiment(comment);

    const review = {
      id: crypto.randomUUID(),
      car_id,
      user: {
        id: req.user.id,
        name: req.user.name ?? "Anonymous",
      },
      rating,
      comment: comment.trim(),
      sentiment: label,
      sentiment_score: score,
      created_at: new Date().toISOString(),
    };
    reviews.push(review);

    return reply.code(201).send(publicReview(review));
  }
);

/**
 * DELETE /reviews/:review_id  (protected — only the author or an admin)
 */
app.delete(
  "/reviews/:review_id",
  { preHandler: [app.authenticate] },
  async (req, reply) => {
    const idx = reviews.findIndex((r) => r.id === req.params.review_id);
    if (idx === -1) return reply.code(404).send({ error: "Review not found" });

    const review = reviews[idx];
    const isOwner = review.user.id === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return reply.code(403).send({ error: "Not allowed to delete this review" });
    }

    reviews.splice(idx, 1);
    return { message: "deleted" };
  }
);

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 4002);
app.listen({ port: PORT, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
