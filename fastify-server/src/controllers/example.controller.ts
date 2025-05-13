import { Controller, Get } from "@/decorators/route.decorator";
import { FastifyReply } from "fastify";

@Controller("/example")
export class Example {
  a = 1;
  @Get("/get")
  async exampleGet(req: any, reply: FastifyReply) {
    reply.customCode(1000).send({ id: 1 });
  }
}
