import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const DEFAULT_JWT_SECRET = "autodrive-dev-secret-change-in-prod";
const DEFAULT_SENTIMENT_URL = "https://autodrive-ml-samarth.azurewebsites.net/sentiment";

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

export async function buildApp(options = {}) {
  const app = Fastify({ logger: options.logger ?? true });
  const reviews = options.reviews ?? [];
  const sentimentUrl =
    options.sentimentUrl ?? process.env.SENTIMENT_API_URL ?? DEFAULT_SENTIMENT_URL;

  await app.register(cors, { origin: "*" });
  await app.register(jwt, {
    secret: options.jwtSecret ?? process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
  });

  app.decorate("authenticate", async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  async function analyzeSentiment(text) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(sentimentUrl, {
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
      app.log.warn({ err: err.message }, "sentiment unavailable; using neutral default");
      return { label: "neutral", score: 0.5 };
    }
  }

  const healthHandler = async () => ({ service: "reviews", status: "ok" });
  app.get("/health", healthHandler);
  app.get("/reviews/health", healthHandler);

  app.get("/reviews/:car_id", async (req) => {
    const { car_id } = req.params;
    const list = reviews
      .filter((r) => r.car_id === car_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const total = list.length;
    const average_rating =
      total === 0
        ? 0
        : Math.round((list.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10;

    return {
      reviews: list.map(publicReview),
      average_rating,
      total,
    };
  });

  app.post(
    "/reviews/:car_id",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { car_id } = req.params;
      const { rating, comment } = req.body ?? {};

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return reply.code(400).send({ error: "rating must be an integer 1-5" });
      }
      if (typeof comment !== "string" || comment.trim().length < 3) {
        return reply.code(400).send({ error: "comment must be at least 3 characters" });
      }

      const { label, score } = await analyzeSentiment(comment);
      const review = {
        id: randomUUID(),
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
    },
  );

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
    },
  );

  return app;
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun && process.env.NODE_ENV !== "test") {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 4002);
  app.listen({ port, host: "0.0.0.0" }).catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
}
