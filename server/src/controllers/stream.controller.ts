import { Request, Response } from 'express';
import { StreamUtils } from '../utils/stream';
import { Controller, Get } from '../decorators/route.decorator';
import { generateMockData } from '../services/mockData.service';
import { Use } from '@/decorators/middleware.decorator';
import { loggerMiddleware } from '../middlewares/loggerMiddleware';

@Controller('/stream')
@Use(loggerMiddleware)
export class StreamController {
  // SSE 示例
  @Get('/sse')
  async sseExample(req: Request, res: Response) {
    const stream = StreamUtils.initSSE(res);
    
    // 发送初始数据
    stream.send({ status: 'STARTED' });
    
    // 模拟数据推送
    const interval = setInterval(() => {
      stream.send({
        timestamp: Date.now(),
        value: Math.random() * 100
      });
    }, 1000);

    // 处理客户端断开连接
    req.on('close', () => {
      clearInterval(interval);
      stream.close();
    });
  }

  // 分块传输示例
  @Get('/chunked')
  chunkedExample(req: Request, res: Response) {
    const stream = StreamUtils.initChunkedStream(res);
    
    // 分批发送数据
    let count = 0;
    const maxItems = 10;
    
    const interval = setInterval(() => {
      if (count >= maxItems) {
        clearInterval(interval);
        stream.close();
        return;
      }
      
      stream.send({
        id: count++,
        data: generateMockData()
      });
    }, 500);
  }

  // 大文件流式传输
  @Get('/file')
  streamFileExample(req: Request, res: Response) {
    const filePath = '@/controllers/large-file.zip';
    StreamUtils.streamFile(res, filePath);
  }
}