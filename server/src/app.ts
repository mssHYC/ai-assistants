import express, { Application } from 'express';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { ExampleController } from './controllers/example.controller';
import { registerRoutes } from './utils/register-routes';
import 'reflect-metadata';
import { streamErrorHandler } from './middlewares/streamErrorHandler';
import { StreamController } from './controllers/stream.controller';

const app: Application = express();

// 中间件
app.use(express.json());

// 注册路由
const router = express.Router();
registerRoutes(router, [ExampleController]);
app.use(router);

const streamRouter = express.Router();
registerRoutes(streamRouter, [StreamController]);
app.use(streamRouter);

// 错误处理
app.use(streamErrorHandler); // 需要在普通错误处理之前
app.use(notFoundHandler);
app.use(errorHandler);

export default app;