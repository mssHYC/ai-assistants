export class HttpError extends Error {
    constructor(
      public code: number,
      public message: string,
      public details?: any
    ) {
      super(message);
    }
  
    toJSON() {
      return {
        code: this.code,
        message: this.message,
        ...(process.env.NODE_ENV === 'development' && { error: this.details }),
      };
    }
  }
  
  // 示例：业务错误扩展
  export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized', details?: any) {
      super(401, message, details);
    }
  }
  
  export class ValidationError extends HttpError {
    constructor(message = 'Validation Failed', details?: any) {
      super(400, message, details);
    }
  }