import { Request, Response } from "express";
import { ApiResponse } from "../utils/response";
import { Controller, Get, Post } from "../decorators/route.decorator";
import { Validate } from "../decorators/validate.decorator";
import { z } from "zod";
import { Use } from "../decorators/middleware.decorator";
import { loggerMiddleware } from "../middlewares/loggerMiddleware";
import DeepSeekService from "@/services/DeepSeek.service";
import { Body, Params, Query } from "@/decorators/params.decorator";
import { IsString, IsEmail, IsNumber } from 'class-validator';


class BodyModel {
  @IsString({ message: "name must be a string" })
  name: string;

  @IsNumber()
  age: number;
}
interface QueryModel {
  name: string;
  age: number;
}

@Controller("/example")
export class ExampleController {
  model: DeepSeekService = new DeepSeekService();

  @Get("/")
  async getExample(req: Request, res: Response) {
    try {
      const data = { message: "Hello World321333321" };
      ApiResponse.success(res, data);
    } catch (err) {
      ApiResponse.error(res, "Failed to get example", 500, err);
    }
  }

  @Post("/:id")
  // @Validate(exampleSchema)
  @Use(loggerMiddleware)
  async postExample(
    @Body(BodyModel) body: BodyModel,
    @Query() query: QueryModel,
    @Params() params: any,
    req: Request,
    res: Response
  ) {
    console.log(body, "body");
    console.log(query, "query");
    console.log(params, "params");
    try {
      const { name, age } = req.body;
      const result = { name, age, status: "created" };
      ApiResponse.success(res, result, `${body.age} years old ${body.name}`);
    } catch (err) {
      ApiResponse.error(res, "Failed to create example", 500, err);
    }
  }
}
