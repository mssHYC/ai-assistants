import { Response } from "express";

type ResponseData<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
};

export class ApiResponse {
  static success<T>(res: Response, data?: T, message: string = "Success") {
    const response: ResponseData<T> = {
      success: true,
      message,
      data,
    };
    res.status(200).json(response);
  }

  static error(
    res: Response,
    message: string = "Internal Server Error",
    statusCode: number = 500,
    error?: any
  ) {
    const response: ResponseData<null> = {
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    };
    res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: any,
    message: string = "Validation Error"
  ) {
    const response: ResponseData<null> = {
      success: false,
      message,
      error: errors,
    };
    res.status(400).json(response);
  }
}
