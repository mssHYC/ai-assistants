import { Request, Response } from 'express';
import { ApiResponse } from '../utils/response';
import { z } from 'zod';

// 定义验证模式
export const exampleSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    age: z.number().min(18)
  }),
  query: z.object({
    debug: z.string().optional()
  })
});

export class ExampleController {
  static async getExample(req: Request, res: Response) {
    try {
      // 业务逻辑
      const data = { message: 'Hello World312' };
      ApiResponse.success(res, data);
    } catch (err) {
      ApiResponse.error(res, 'Failed to get example', 500, err);
    }
  }

  static async postExample(req: Request, res: Response) {
    try {
      // 业务逻辑
      const { name, age } = req.body;
      const result = { name, age, status: 'created' };
      ApiResponse.success(res, result, 'Example created successfully');
    } catch (err) {
      ApiResponse.error(res, 'Failed to create example', 500, err);
    }
  }
}