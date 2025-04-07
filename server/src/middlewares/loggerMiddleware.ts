import { NextFunction, Request, Response } from "express";

// 创建一个日志中间件
export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}
