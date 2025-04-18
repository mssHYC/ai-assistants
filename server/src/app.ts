import "reflect-metadata";

import express, { Application } from "express";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import cors from "cors";
import { ExampleController } from "./controllers/example.controller";
import { registerRoutes } from "./utils/register-routes";
import { streamErrorHandler } from "./middlewares/streamErrorHandler";
import { StreamController } from "./controllers/stream.controller";
import { DeepSeekController } from "./controllers/deepseek.controller";

const app: Application = express();

const corsOptions = {
  origin: "*", // 允许单个来源
  methods: ["GET", "POST", "PUT", "DELETE"], // 允许的方法
  allowedHeaders: ["Content-Type", "Authorization"], // 允许的头信息
  credentials: false, // 允许发送凭证（如 cookies）
  optionsSuccessStatus: 200, // 预检请求的成功状态码
};

app.use(cors(corsOptions));

// 中间件
app.use(express.json());

// 注册路由
const router = express.Router();
registerRoutes(router, [
  ExampleController,
  DeepSeekController,
  StreamController,
]);
app.use(router);

// 错误处理
app.use(streamErrorHandler); // 需要在普通错误处理之前
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
