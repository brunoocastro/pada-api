import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { cryptoHelper } from '../../../helpers/crypto.helper';
import { UserResponseDto } from '../../users/dto/response/user-response.dto';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersRepository } from '../../users/repository/users.repository';
import { UsersService } from '../../users/service/users.service';
import { LoginUserResponseDto } from '../dto/response/login-user-response.dto';
import { UserWithTokenResponseDto } from '../dto/response/user-with-token-response.dto';
import { RegisterUserDto } from './../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  private async generateUserToken(userProps: UserResponseDto) {
    return this.jwtService.sign(instanceToPlain(userProps));
  }

  async validateUserLogin(
    email: string,
    password: string,
  ): Promise<UserWithTokenResponseDto> {
    const possibleUser = await this.getUserWithSensitiveDataByEmail(email);

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

    const user = await this.usersService.sendAccountVerificationMailById(
      newUser.id,
    );
    return user;
  }

  private async getUserWithSensitiveDataByEmail(
    email: string,
  ): Promise<UserEntity> {
    const possibleUser = await this.usersRepository.findByEmail(email);

    if (!possibleUser) return null;

    return new UserEntity(possibleUser);
  }
}
