import "reflect-metadata";
import type { FastifyInstance } from "fastify";
import { Methods, ROUTE_METADATA_KEY } from "@/decorators/route.decorator";

export const registerRoutes = (app: FastifyInstance, controllers: any[]) => {
  controllers.forEach((controller) => {
    const metadata: {
      path: string;
      method: Methods;
      handler: Function;
    }[] = Reflect.getMetadata(ROUTE_METADATA_KEY, controller.prototype) || [];
    const cls = new controller();
    const basePath = cls.basePath;
    metadata.forEach(({ path, method, handler }) => {
      app[method](
        `${basePath}${path}`,
        {
          config: {
            skipWrap: false,
          },
        },
        (request, reply) => {
          handler.call(cls, request, reply);
        }
      );
    });
  });
};
