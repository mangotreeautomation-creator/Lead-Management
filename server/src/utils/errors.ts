import { FastifyReply, FastifyRequest } from 'fastify';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: Array<{ name: string; reason: string }>;
  code?: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly invalidParams?: Array<{ name: string; reason: string }>;

  constructor(status: number, message: string, code: string = 'INTERNAL_ERROR', invalidParams?: Array<{ name: string; reason: string }>) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.invalidParams = invalidParams;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(404, message, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'UNAUTHORIZED') {
    super(401, message, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', code: string = 'FORBIDDEN') {
    super(403, message, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code: string = 'BAD_REQUEST', invalidParams?: Array<{ name: string; reason: string }>) {
    super(400, message, code, invalidParams);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict with existing resource', code: string = 'CONFLICT') {
    super(409, message, code);
  }
}

export function handleFastifyError(error: any, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error);

  const status = error.status || error.statusCode || 500;
  const problem: ProblemDetails = {
    type: `https://httpstatuses.com/${status}`,
    title: error.name || 'Error',
    status,
    detail: error.message || 'An unexpected internal error occurred.',
    instance: request.raw.url || request.url,
    code: error.code || 'INTERNAL_ERROR',
  };

  if (error.validation) {
    problem.title = 'Validation Error';
    problem.status = 400;
    problem.code = 'VALIDATION_FAILED';
    problem.invalidParams = error.validation.map((v: any) => ({
      name: v.instancePath || v.params?.missingProperty || 'unknown',
      reason: v.message || 'Invalid format',
    }));
  } else if (error.invalidParams) {
    problem.invalidParams = error.invalidParams;
  }

  reply.status(problem.status).header('Content-Type', 'application/problem+json').send(problem);
}
