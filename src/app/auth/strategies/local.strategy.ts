import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { Strategy } from 'passport-local';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { AuthService } from '../service/auth.service';
import { UserLoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    const loginDto = plainToClass(UserLoginDto, {
      email,
      password,
    });

    const user = await this.authService.validateUserLogin(
      loginDto.email,
      loginDto.password,
    );

    if (!user)
      throw new UnauthorizedException(MessagesHelper.InvalidEmailOrPassword);

    return user;
  }
}
