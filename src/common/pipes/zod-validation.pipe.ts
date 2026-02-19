import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value || {});
    } catch (error) {
      throw new BadRequestException(
        'Um parametro invalido ou um intervalo de datas inválido foi informado',
        {
          cause: error,
        },
      );
    }
  }
}
