/**
 * Custom application error class.
 * Extends the native Error with an HTTP status code and an operational flag
 * to distinguish expected errors (bad input, not found) from bugs.
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
