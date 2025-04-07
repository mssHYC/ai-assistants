import { RequestHandler } from 'express';

export function Use(...middlewares: RequestHandler[]) {
  return function (target: any, propertyKey?: string) {
    if (propertyKey) {
      // 方法装饰器
      const existingMiddlewares: RequestHandler[] = Reflect.getMetadata('middlewares', target, propertyKey) || [];
      Reflect.defineMetadata('middlewares', [...existingMiddlewares, ...middlewares], target, propertyKey);
    } else {
      // 类装饰器
      const existingMiddlewares: RequestHandler[] = Reflect.getMetadata('middlewares', target.prototype) || [];
      Reflect.defineMetadata('middlewares', [...existingMiddlewares, ...middlewares], target.prototype);
    }
  };
}