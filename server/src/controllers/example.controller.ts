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
import { ensureDirExists, getStorageDir } from "@/utils/paths";
import DB from "@/model/MongoDB";
import { StreamUtils } from "@/utils/stream";
import fs from "fs";

class BodyModel {
  @IsString()
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
    @Params() params: any,
    req: Request,
    res: Response
  ) {
    console.log(body, "body");
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
      console.log("页面标题:", title);
      const originalPath = getStorageDir(["storage", "screenshot", `${query.id}`]);
      ensureDirExists(["storage", "screenshot", `${query.id}`]);
      const srcs = await page.$$(".message-body .tile-item[data-fancybox='gallery'] img");
      for (const img of srcs) {
        const src = await img.evaluate(el => el.src);
        const page = await browser.newPage();
        //@ts-ignore
        await page.goto(src.replace('_s_', '_l_'), {
          waitUntil: "networkidle2", // 等待网络空闲
          timeout: 30000, // 30秒超时

        });
        const imgEl = await page.$("img")!
        await imgEl?.screenshot({
          path: getStorageDir(["storage", "screenshot", `${query.id}`, `${srcs.indexOf(img)}.png`]),
        })
        await page.close();
      }
      await page.close();
      ApiResponse.success(res, 'The task is done, can start the next task');
      // await StreamUtils.streamFile(res, paths);
    } catch (err) {
      console.log(err);
      ApiResponse.error(res, "Failed to get example", 500, err);
    } finally {
      // 关闭浏览器
      await browser.close();
    }
  }

  @Get("/connect-mongo")
  async connectMongo(req: Request, res: Response) {
    try {
      console.log(new Date().toString());
      const _res = await DB.findMany('test');
      ApiResponse.success(res, _res);
      DB.disconnect();

    } catch (err) {
      // @ts-ignore
      ApiResponse.error(res, err.toString(), 500, err);
    }
  }
}
