import { Request, Response } from "express";
import { ApiResponse } from "../utils/response";
import { Controller, Get, Post } from "../decorators/route.decorator";
import { Validate } from "../decorators/validate.decorator";
import { z } from "zod";
import { Use } from "../decorators/middleware.decorator";
import { loggerMiddleware } from "../middlewares/loggerMiddleware";
import DeepSeekService from "@/services/DeepSeek.service";
import { Body, Params, Query } from "@/decorators/params.decorator";
import { IsString, IsEmail, IsNumber } from "class-validator";
import Browser from "@/model/Browser";
import path from "path";
import { ensureDirExists, getStorageDir } from "@/utils/paths";

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

  @Get("/open-chrome")
  @Validate(
    z.object({
      query: z.object({
        path: z.string(),
        id: z.string(),
      }),
    })
  )
  async openChrome(
    @Query() query: { path: string; id: string },
    req: Request,
    res: Response
  ) {
    console.log(query, "query");
    // @ts-ignore
    // 启动无头浏览器
    const browser = await Browser.create();
    try {
      // 创建新页面
      const page = await browser.newPage();
      // 导航到目标网页
      await page.goto(query.path, {
        waitUntil: "networkidle2", // 等待网络空闲
        timeout: 30000, // 30秒超时
      });

      // 执行页面操作
      const title = await page.title();
      let file;
      console.log("页面标题:", title);
      if (process.env.NODE_ENV === "docker") {
        file = await page.screenshot({
          fullPage: true,
        });
      } else {
        ensureDirExists(["screenshot"]);
        // 截图保存
        file = await page.screenshot({
          path: getStorageDir(["screenshot", `${query.id}.png`]),
          fullPage: true,
        });
      }

      ApiResponse.success(res, Buffer.from(file).toString("base64"));
    } catch (err) {
      console.log(err);
      ApiResponse.error(res, "Failed to get example", 500, err);
    } finally {
      // 关闭浏览器
      await browser.close();
    }
  }
}
