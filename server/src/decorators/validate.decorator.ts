import { validate } from '../middlewares/validation';
import { z } from 'zod';

export function Validate(schema: z.ZodSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (req: any, res: any, next?: any) {
      validate(schema)(req, res, (err?: any) => {
        if (err) return next(err);
        return originalMethod.apply(this, [req, res, next]);
      });
    };
    
    return descriptor;
  };
}