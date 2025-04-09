import { Request, Response } from "express";
import { ApiResponse } from "../utils/response";
import { Controller, Get, Post } from "../decorators/route.decorator";
import { Use } from "../decorators/middleware.decorator";
import { loggerMiddleware } from "../middlewares/loggerMiddleware";
import DeepSeekService, { Message, ModelType } from "@/services/DeepSeek.service";
import { Body, Params, Query } from "@/decorators/params.decorator";
import { StreamUtils } from "@/utils/stream";


class MessageModel {
    messages: Message[]
}

@Controller("/deepseek")
export class DeepSeekController {
    model: DeepSeekService = new DeepSeekService();

    @Post("/send-v3-stream")
    async sendV3Stream(@Body(MessageModel) body: MessageModel, req: Request, res: Response) {
        try {
            const stream = StreamUtils.initSSE(res);
            const data = await this.model.send(body.messages, ModelType.V3, true)
            for await (const chunk of data) {
                stream.send(chunk);
            }
            stream.close();
        } catch (err) {
            ApiResponse.error(res, "Failed to get example", 500, err);
        }
    }

    @Post("/send-v3")
    async sendV3(@Body(MessageModel) body: MessageModel, req: Request, res: Response) {
        try {
            const data = await this.model.send(body.messages, ModelType.V3);
            ApiResponse.success(res, data,);
        } catch (err) {
            ApiResponse.error(res, "Failed to get example", 500, err);
        }
    }
}
