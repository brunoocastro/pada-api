import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export const ExclusiveForUserWithId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // todo -> implementar permissão para administradores
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user.id !== request.params.id)
      throw new UnauthorizedException(
        'This data is exclusive for account owner.',
      );

    return request.params.id;
  },
);
