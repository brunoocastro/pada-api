import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export const ExclusiveForUserWithId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    // todo -> implementar permissão para administradores
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user.id !== request.params.id)
      throw new UnauthorizedException();

    return request.params.id;
  },
);
