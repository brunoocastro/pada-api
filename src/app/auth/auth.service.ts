import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { cryptoHelper } from '../../helpers/crypto.helper';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async generateUserToken(userProps: UserResponseDto) {
    return this.jwtService.sign(instanceToPlain(userProps));
  }

  async validateUserLogin(email: string, password: string): Promise<any> {
    const possibleUser = await this.usersService.findByEmailWithSensitiveData(
      email,
    );

    if (!possibleUser) throw new UnauthorizedException();

    const validPassword = cryptoHelper.validatePassword(
      password,
      possibleUser.password,
    );

    if (!validPassword) throw new UnauthorizedException();

    const userTokenPayload = plainToInstance(UserResponseDto, possibleUser, {
      excludeExtraneousValues: true,
    });

    const loggedUserToken = await this.generateUserToken(userTokenPayload);

    return { token: loggedUserToken, ...userTokenPayload };
  }

  async registerUser(userRegisterDto: RegisterUserDto) {
    const newUser = await this.usersService.create(userRegisterDto);
    const user = await this.usersService.sendUserConfirmationMailById(
      newUser.id,
    );
    return user;
  }
}
