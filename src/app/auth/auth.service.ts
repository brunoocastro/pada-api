import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { UserRegisterDto } from './dto/register.dto';
import { UserTokenPayloadDto } from './dto/tokenPayload.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserLogin(email: string, password: string): Promise<any> {
    const possibleUser = await this.usersService.findByEmailWithSensitiveData(
      email,
    );
    console.log({ possibleUser });

    if (!possibleUser) return null;

    const validPassword = compareSync(password, possibleUser.password);

    if (!validPassword) return null;

    const userTokenPayload = plainToInstance(
      UserTokenPayloadDto,
      possibleUser,
      { excludeExtraneousValues: true },
    );

    console.log({ userTokenPayload });

    const loggedUserToken = await this.generateUserToken(userTokenPayload);

    return { token: loggedUserToken, ...userTokenPayload };
  }

  private async generateUserToken(userProps: UserTokenPayloadDto) {
    return this.jwtService.sign(instanceToPlain(userProps));
  }

  async registerUser(userRegisterDto: UserRegisterDto) {
    const newUser = await this.usersService.create(userRegisterDto);
    await this.usersService.sendConfirmationEmail(newUser.id);
    return newUser;
  }
}
