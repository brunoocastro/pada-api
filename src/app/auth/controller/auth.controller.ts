import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './../service/auth.service';
import { RegisterUserDto } from './../dto/register.dto';
import { LocalAuthGuard } from './../guards/local.guards';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from '../dto/login.dto';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { UnauthorizedResponseDto } from '../../../helpers/swagger/unauthorized.dto';
import { BadRequestResponseDto } from '../../../helpers/swagger/bad-request.dto';
import { LoginUserResponseDto } from '../dto/response/login-user-response.dto';
import { UserWithTokenResponseDto } from '../dto/response/user-with-token-response.dto';
import { DefaultUserControllerResponseDto } from '../../users/dto/response/default-user-response.dto';
import { LocalStrategy } from '../strategies/local.strategy';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly localStrategy: LocalStrategy,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged with success',
    type: LoginUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: MessagesHelper.InvalidEmailOrPassword,
    type: UnauthorizedResponseDto,
  })
  async login(@Body() login: UserLoginDto): Promise<LoginUserResponseDto> {
    const user: UserWithTokenResponseDto = await this.localStrategy.validate(
      login.email,
      login.password,
    );
    return { message: 'Logged with success!', user };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered with success',
    type: DefaultUserControllerResponseDto,
  })
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
