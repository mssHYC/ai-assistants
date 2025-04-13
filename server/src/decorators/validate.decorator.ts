import { NextFunction } from 'express';
import { validate } from '../middlewares/validation';
import { z } from 'zod';


const getMethodArgs = (instance: any, propertyKey: string) => {
  const { index } =
    Reflect.getMetadata("bodyParameters", instance, propertyKey) ?? {};
  const { index: queryIndex } =
    Reflect.getMetadata("queryParameters", instance, propertyKey) ?? {};
  const { index: paramsIndex } =
    Reflect.getMetadata("paramsParameters", instance, propertyKey) ?? {};
  return [index, queryIndex, paramsIndex].filter((item) => item !== undefined);
};


export function Validate(schema: z.ZodSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const paramsArr = getMethodArgs(target, propertyKey);
    descriptor.value = function (...args: any[]) {
      const [req, res, next] = args.filter((_, index) => !paramsArr.includes(index));
      validate(schema)(req, res, (err?: any) => {
        if (err) return next?.(err);
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}