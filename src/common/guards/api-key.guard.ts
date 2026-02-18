import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (apiKey !== process.env.REPORTS_API_KEY) {
      throw new UnauthorizedException(
        'Acesso negado: API Key inválida ou ausente',
      );
    }
    return true;
  }
}
