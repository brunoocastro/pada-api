import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserLogin(email: string, password: string): Promise<any> {
    const possibleUser = await this.usersService.findByEmail(email);

    if (!possibleUser) return null;

    const validPassword = compareSync(password, possibleUser.password);

    if (!validPassword) return null;

    const loggedUser = this.generateUserWithToken(possibleUser.id);

    return loggedUser;
  }

  async generateUserWithToken(id: string) {
    const {
      id: _id,
      birth,
      ...authenticatedUser
    } = await this.usersService.userLoginConfirmed(id);
    const payload = { sub: id, ...authenticatedUser };

    return {
      token: this.jwtService.sign(payload),
      birth,
      ...authenticatedUser,
    };
  }

  async registerUser(userRegisterDto: UserRegisterDto) {
    return await this.usersService.create(userRegisterDto);
  }
}
