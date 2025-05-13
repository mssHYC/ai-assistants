import "./config/config";
import fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import env from "./config/env";
import { Example } from "./controllers/example.controller";
import { registerRoutes } from "./utils/register-routes";
import { HttpError, ValidationError } from "./types/http-error";

const app: FastifyInstance = fastify({
  logger: true,
});

// 添加装饰器
app.decorateReply("customCode", function (this: FastifyReply, code: number) {
  if (!this.context) {
    this.context = {};
  }
  this.context.customCode = code; // 将业务码存储到上下文中
  return this;
});
app.decorateReply("skipWrap", function (this: FastifyReply, skip: boolean) {
  let context = this.context;
  if (!context) {
    context = {
      config: {
        skipWrap: skip,
      },
    };
  } else {
    context.config = {
      skipWrap: skip,
    };
  }
  this.context = context;
  return this;
});

app.addHook("onSend", (request, reply, payload, done) => {
  if (reply.context?.config?.skipWrap) {
    return done(null, payload);
  }
  const code = reply?.context?.customCode || reply.statusCode;
  const response = {
    code,
    data: payload ? JSON.parse(payload as string) : null,
  };
  done(null, JSON.stringify(response));
});

app.setErrorHandler(
  (
    err: FastifyError | HttpError,
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    // 跳过已处理的错误或特定路由
    if (reply.sent) {
      return;
    }
    if (err instanceof HttpError) {
      reply.status(err.code).send({
        code: err.code,
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { error: err.details }),
      });
      return;
    }

    // 处理 Fastify 内置错误（如验证错误）
    if (err.validation) {
      const validationError = new ValidationError(
        "Invalid Request",
        err.validation
      );
      reply.status(400).send(validationError.toJSON());
      return;
    }
  }
);

app.setNotFoundHandler((req, reply) => {
  reply.status(404).send({
    code: 404,
    message: "Not Found",
  });
});

registerRoutes(app, [Example]);

const start = async () => {
  try {
    app.listen({ port: env.PORT });
    console.log(`Server running at http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
