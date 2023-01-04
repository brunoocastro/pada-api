import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './../service/auth.service';
import { LoggedUser } from './../decorators/logged-user.decorator';
import { RegisterUserDto } from './../dto/register.dto';
import { LocalAuthGuard } from './../guards/local.guards';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from '../dto/login.dto';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { DefaultUserResponseDto } from '../../../helpers/swagger/default-user-response.dto';
import { UnauthorizedResponseDto } from '../../../helpers/swagger/unauthorized.dto';
import { BadRequestResponseDto } from '../../../helpers/swagger/bad-request.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged with success',
    type: DefaultUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: MessagesHelper.InvalidEmailOrPassword,
    type: UnauthorizedResponseDto,
  })
  async login(
    @Body() login: UserLoginDto,
    @LoggedUser() user: UserResponseDto,
  ) {
    return { message: 'Logged with success!', user };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered with success' })
  @ApiResponse({
    status: 400,
    description: 'Email already in use, password not secure or invalid body',
    type: BadRequestResponseDto,
  })
  async register(@Body() userRegisterDto: RegisterUserDto) {
    const newUser = await this.authService.registerUser(userRegisterDto);
    return { message: 'Registered with success!', user: newUser };
  }
}
