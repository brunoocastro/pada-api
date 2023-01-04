import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { AuthService } from './../service/auth.service';
import { LoggedUser } from './../decorators/logged-user.decorator';
import { RegisterUserDto } from './../dto/register.dto';
import { LocalAuthGuard } from './../guards/local.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@LoggedUser() user: UserEntity) {
    return { message: 'Logged with success!', user };
  }

  @Post('register')
  async register(@Body() userRegisterDto: RegisterUserDto) {
    const newUser = await this.authService.registerUser(userRegisterDto);
    return { message: 'Registered with success!', user: newUser };
  }
}
