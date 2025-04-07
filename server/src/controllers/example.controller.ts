import { Request, Response } from 'express';
import { ApiResponse } from '../utils/response';
import { Controller, Get, Post } from '../decorators/route.decorator';
import { Validate } from '../decorators/validate.decorator';
import { z } from 'zod';
import { Use } from '../decorators/middleware.decorator';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';


const exampleSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    age: z.number().min(18)
  }),
  query: z.object({
    debug: z.string().optional()
  })
});

@Controller('/example')
@Use(loggerMiddleware)
export class ExampleController {
  @Get('/')
  async getExample(req: Request, res: Response) {
    try {
      const data = { message: 'Hello World' };
      ApiResponse.success(res, data);
    } catch (err) {
      ApiResponse.error(res, 'Failed to get example', 500, err);
    }
  }

  @Post('/')
  @Validate(exampleSchema)
  async postExample(req: Request, res: Response) {
    try {
      const { name, age } = req.body;
      const result = { name, age, status: 'created' };
      ApiResponse.success(res, result, 'Example created successfully');
    } catch (err) {
      ApiResponse.error(res, 'Failed to create example', 500, err);
    }
  }
}