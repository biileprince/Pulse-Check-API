import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

/**
 * Centralized error handling middleware.
 * Catches all errors thrown or passed via next() and returns a consistent
 * JSON response format.
 */
const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError && err.isOperational
      ? err.message
      : 'Internal server error';

  // Log unexpected errors for debugging
  if (!(err instanceof AppError) || !err.isOperational) {
    console.error('Unexpected Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
    },
  });
};

export default errorHandler;
