import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ service: "reviews", status: "ok" }));

app.listen({ port: 4002, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

