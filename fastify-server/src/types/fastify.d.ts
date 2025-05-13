import "fastify";

declare module "fastify" {
  interface FastifyReply {
    customCode(code: number): this;
    skipWrap(skip: boolean): this;
    context: {
      customCode?: number; // 自定义业务码
      config?: {
        skipWrap?: boolean; // 跳过统一响应的配置
      };
    };
  }
  interface RouteShorthandOptions {
    config?: { skipWrap?: boolean };
  }
}
