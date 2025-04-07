import 'reflect-metadata';
import { RequestHandler } from 'express';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch'
}

export interface RouteDefinition {
  path: string;
  method: HttpMethod;
  middlewares: RequestHandler[];
  handlerName: string;
}

export function Controller(basePath: string = '') {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      basePath = basePath;
    };
  };
}

export function Route(method: HttpMethod, path: string = '', ...middlewares: RequestHandler[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];
    routes.push({
      method,
      path,
      middlewares,
      handlerName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
}

export function Get(path: string = '', ...middlewares: RequestHandler[]) {
  return Route(HttpMethod.GET, path, ...middlewares);
}

export function Post(path: string = '', ...middlewares: RequestHandler[]) {
  return Route(HttpMethod.POST, path, ...middlewares);
}

export function Put(path: string = '', ...middlewares: RequestHandler[]) {
  return Route(HttpMethod.PUT, path, ...middlewares);
}

export function Delete(path: string = '', ...middlewares: RequestHandler[]) {
  return Route(HttpMethod.DELETE, path, ...middlewares);
}

export function Patch(path: string = '', ...middlewares: RequestHandler[]) {
  return Route(HttpMethod.PATCH, path, ...middlewares);
}