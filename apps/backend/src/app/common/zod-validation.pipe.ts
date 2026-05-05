import { BadRequestException, PipeTransform } from '@nestjs/common';
import { type ZodIssue, type ZodTypeAny } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map(formatIssue),
      });
    }

    return result.data;
  }
}

function formatIssue(issue: ZodIssue) {
  return {
    path: issue.path.join('.'),
    message: issue.message,
  };
}
