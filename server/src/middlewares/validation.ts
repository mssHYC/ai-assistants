import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => ({
          path: error.path.join('.'),
          message: error.message
        }));
        return ApiResponse.validationError(res, errorMessages);
      }
      return ApiResponse.error(res, 'Validation failed', 400);
    }
  };
};