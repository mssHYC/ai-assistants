import { Controller, Get } from "@/decorators/route.decorator";

@Controller("/example")
export class Example {
  a = 1;
  @Get("/get")
  async exampleGet(req: any, res: any) {
    return res.send("321321");
  }
}
