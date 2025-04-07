import { Request, Response, NextFunction } from 'express';
import { StreamUtils } from '../utils/stream';

export const streamErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    const stream = StreamUtils.initSSE(res);
    stream.send({ 
      error: true,
      message: err.message,
      code: 'STREAM_ERROR'
    }, 'error');
    stream.close();
    return;
  }
  
  next(err);
};