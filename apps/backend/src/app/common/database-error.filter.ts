import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

type PgErrorLike = {
  code?: string;
  constraint?: string;
  detail?: string;
  message?: string;
  cause?: unknown;
};

@Catch()
export class DatabaseErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    const pgError = findPgError(exception);
    if (pgError) {
      const mapped = mapPgError(pgError);
      response.status(mapped.statusCode).json(mapped);
      return;
    }

    this.logger.error(messageFrom(exception), stackFrom(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}

function findPgError(value: unknown): PgErrorLike | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.code === 'string') {
    return value as PgErrorLike;
  }

  if ('cause' in value) {
    return findPgError(value.cause);
  }

  return undefined;
}

function mapPgError(error: PgErrorLike) {
  switch (error.code) {
    case '23503':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Referenced record does not exist',
        constraint: error.constraint,
      };
    case '23505':
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Record already exists',
        constraint: error.constraint,
      };
    case '23502':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Required field is missing',
        constraint: error.constraint,
      };
    case '22P02':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid value',
      };
    default:
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed',
      };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function messageFrom(value: unknown) {
  return value instanceof Error ? value.message : 'Unhandled exception';
}

function stackFrom(value: unknown) {
  return value instanceof Error ? value.stack : undefined;
}
