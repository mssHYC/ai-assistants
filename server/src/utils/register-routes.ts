import { Router, Request } from "express";
import { plainToInstance } from "class-transformer";
// import { validate } from 'class-validator';
import { RouteDefinition } from "../decorators/route.decorator";

const getMethodArgs = (route: RouteDefinition, instance: any, req: Request) => {
  const args = [];
  const { index, type } =
    Reflect.getMetadata("bodyParameters", instance, route.handlerName) ?? {};
  if (index !== undefined) {
    args[index] = type ? plainToInstance(type, req.body) : req.body;
  }
  const { index: queryIndex, type: queryType } =
    Reflect.getMetadata("queryParameters", instance, route.handlerName) ?? {};
  if (queryIndex !== undefined) {
    const _query = JSON.parse(JSON.stringify(req.query));
    args[queryIndex] = queryType
      ? plainToInstance(queryType, req.query)
      : _query;
  }
  const { index: paramsIndex } =
    Reflect.getMetadata("paramsParameters", instance, route.handlerName) ?? {};
  if (paramsIndex !== undefined) {
    args[paramsIndex] = JSON.parse(JSON.stringify(req.params));
  }
  return args;
};

export function registerRoutes(router: Router, controllers: any[]) {
  controllers.forEach((Controller) => {
    const instance = new Controller();
    const basePath = instance.basePath || "";
    const routes: RouteDefinition[] =
      Reflect.getMetadata("routes", Controller) || [];

    routes.forEach((route) => {
      const { method, path, middlewares, handlerName } = route;
      const fullPath = `${basePath}${path}`;

      // 获取类级别中间件
      const classMiddlewares =
        Reflect.getMetadata("middlewares", Controller.prototype) || [];

      // 获取方法级别中间件
      const methodMiddlewares =
        Reflect.getMetadata("middlewares", instance, handlerName) || [];

      // 组合所有中间件
      const allMiddlewares = [
        ...classMiddlewares,
        ...methodMiddlewares,
        ...middlewares,
      ];

      // 注册路由
      router[method](fullPath, ...allMiddlewares, (req: any, res: any) => {
        const args = getMethodArgs(route, instance, req);
        instance[handlerName].apply(instance, [...args, req, res]);
      });
    });
  });
}
