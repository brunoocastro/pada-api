import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { UsersService } from '../users.service';

export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }

  async validateLogin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.usersService.validateUserLogin(email, password);

    if (!user)
      throw new UnauthorizedException(MessagesHelper.InvalidEmailOrPassword);
  }
}
