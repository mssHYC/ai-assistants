import express, { Request, Response } from 'express';
import BaseModel, { Message } from './model/BaseModel';
import { ExampleController, exampleSchema } from './controllers/example.controller';
import { validate } from './middlewares/validation';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 路由
app.get('/example', ExampleController.getExample);
app.post('/example', validate(exampleSchema), ExampleController.postExample);

const port = 3000;

app.get('/', async (req: Request<Message[]>, res: Response) => {
  res.send('312321')
});


app.post('/send', async (req: Request<any, any, { messages: Message[] }>, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const model = new BaseModel();
  const stream = await model.send(req.body.messages)
  // 转发流数据到客户端
  for await (const chunk of stream) {
    res.write(`data: {"choices": ${JSON.stringify(chunk)}}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

export default app

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});