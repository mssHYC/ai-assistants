import { Router, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
// import { validate } from 'class-validator';
import { RouteDefinition } from "../decorators/route.decorator";
import { validate } from 'class-validator';
import { ApiResponse } from "./response";

const getMethodArgs = async (route: RouteDefinition, instance: any, req: Request, res: Response) => {
  const args = [];
  const { index, type } =
    Reflect.getMetadata("bodyParameters", instance, route.handlerName) ?? {};
  if (index !== undefined) {
    if (!Object.keys(req.body).length) {
      return Promise.reject(new Error('Body is empty'));
    }
    const dtoInstance = type ? plainToInstance(type, req.body) : req.body;
    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      return Promise.reject(new Error(errors.join(', ')));
    }
    args[index] = dtoInstance
  }
  const { index: queryIndex, type: queryType } =
    Reflect.getMetadata("queryParameters", instance, route.handlerName) ?? {};
  if (queryIndex !== undefined) {
    const _query = JSON.parse(JSON.stringify(req.query));
    const dtoInstance = plainToInstance(queryType, _query);
    if (Object.keys(dtoInstance).length === 0) {
      return Promise.reject(new Error('Query is empty'));
    }
    args[queryIndex] = dtoInstance;
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
      router[method](fullPath, ...allMiddlewares, async (req: any, res: any) => {
        try {
          const args = await getMethodArgs(route, instance, req, res);
          instance[handlerName].apply(instance, [...args, req, res]);
        } catch (err) {
          ApiResponse.error(res, (err as Error).message, 400, (err as Error).stack);
        }
      });
    });
  });
}
