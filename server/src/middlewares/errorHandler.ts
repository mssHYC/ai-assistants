import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err instanceof SyntaxError) {
    return ApiResponse.error(res, 'Invalid JSON', 400);
  }

  // 你可以在这里添加更多特定的错误处理

  return ApiResponse.error(res, err.message, 500, err);
};

export const notFoundHandler = (req: Request, res: Response) => {
  ApiResponse.error(res, 'Endpoint not found', 404);
};