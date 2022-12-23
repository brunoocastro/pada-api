import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local.guards';

interface RequestWithUser extends ExpressRequest {
  user: Partial<UserEntity>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: RequestWithUser) {
    return { message: 'Logged with success!', user: req.user };
  }

  @Post('register')
  register(@Body() userRegisterDto: UserRegisterDto) {
    return this.authService.registerUser(userRegisterDto);
  }
}
