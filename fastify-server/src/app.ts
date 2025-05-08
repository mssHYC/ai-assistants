import "./config/config";
import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import env from "./config/env";
import { Example } from "./controllers/example.controller";
import { registerRoutes } from "./utils/register-routes";

const app = fastify({
  logger: true,
});

registerRoutes(app, [Example]);

const start = async () => {
  try {
    app.listen({ port: env.PORT });
    console.log(`Server running at http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
