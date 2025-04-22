export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public originalError?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    name: string = "AppError",
    originalError?: Error
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
