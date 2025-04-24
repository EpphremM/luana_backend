import { Request, Response, NextFunction } from "express";
import { AppError } from "../express/error/app.error";

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status = "fail";
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const name = err.name || "Operational";
  const errorDetails = err.stack || null;

  res.status(statusCode).json({
    status,
    message,
    name,
    error: errorDetails,
  });
};
