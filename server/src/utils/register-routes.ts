import { Router } from 'express';
import { RouteDefinition } from '../decorators/route.decorator';

export function registerRoutes(router: Router, controllers: any[]) {
  controllers.forEach(Controller => {
    const instance = new Controller();
    const basePath = instance.basePath || '';
    const routes: RouteDefinition[] = Reflect.getMetadata('routes', Controller) || [];

    routes.forEach(route => {
      const { method, path, middlewares, handlerName } = route;
      const fullPath = `${basePath}${path}`;
      
      // 获取类级别中间件
      const classMiddlewares = Reflect.getMetadata('middlewares', Controller.prototype) || [];
      
      // 获取方法级别中间件
      const methodMiddlewares = Reflect.getMetadata('middlewares', instance, handlerName) || [];
      
      // 组合所有中间件
      const allMiddlewares = [...classMiddlewares, ...methodMiddlewares, ...middlewares];
      
      // 注册路由
      router[method](fullPath, ...allMiddlewares, (req: any, res: any) => {
        instance[handlerName](req, res);
      });
    });
  });
}