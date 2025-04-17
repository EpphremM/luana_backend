export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public originalError?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    name: string = 'AppError',
    originalError?: Error
  ) {
    super(message);

    this.name = name;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.isOperational = true; // Flag to indicate this is a handled (expected) error

    // Restore the prototype chain (for instanceof checks to work properly)
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures the stack trace excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}
