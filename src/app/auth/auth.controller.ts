import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoggedUser } from './decorators/logged-user.decorator';
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
  async login(@LoggedUser() user: UserEntity) {
    return { message: 'Logged with success!', user };
  }

  @Post('register')
  async register(@Body() userRegisterDto: UserRegisterDto) {
    const newUser = await this.authService.registerUser(userRegisterDto);
    return { message: 'Registered with success!', newUser };
  }
}
