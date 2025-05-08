declare module "../decorators/route.decorator" {
  interface ControllerStatic {
    registerRoutes(app: FastifyInstance): void;
  }

  export const Controller: ControllerDecorator;
}
