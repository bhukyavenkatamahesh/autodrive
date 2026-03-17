import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ service: "auth", status: "ok" }));

app.listen({ port: 4001, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

