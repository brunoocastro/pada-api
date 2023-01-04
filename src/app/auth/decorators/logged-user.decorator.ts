import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export const LoggedUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserResponseDto => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
