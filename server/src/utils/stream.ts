import { Response } from "express";
import { createReadStream } from "fs";

export class StreamUtils {
  // SSE 流式响应
  static initSSE(res: Response) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    return {
      send: (data: any, eventType = "message") => {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
      close: () => {
        res.end();
      },
    };
  }

  // 通用分块传输
  static initChunkedStream(res: Response, contentType = "application/json") {
    res.writeHead(200, {
      "Content-Type": contentType,
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    return {
      send: (data: any) => {
        res.write(`${JSON.stringify(data)}\n`);
      },
      close: () => {
        res.end();
      },
    };
  }

  // 文件流传输
  static streamFile(res: Response, filePath: string) {
    // const { createReadStream } = require("fs");
    console.log(filePath);
    const stream = createReadStream(filePath);

    stream.on("open", () => {
      stream.pipe(res);
    });

    stream.on("error", (err: Error) => {
      res.status(404).end("File not found");
    });
  }
}
