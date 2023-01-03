import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export const HasConfirmedAccount = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserResponseDto => {
    // todo -> implementar permissão para administradores
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) throw new UnauthorizedException('You must be logged!');

    if (request.user.emailStatus !== 'VERIFIED')
      throw new UnauthorizedException(
        'This data is exclusive for confirmed accounts.',
      );

    return request.user;
  },
);
