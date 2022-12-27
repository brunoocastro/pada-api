import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggedUser } from '../auth/decorators/logged-user.decorator';
import { UserEntity } from './entities/user.entity';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { ExclusiveForUserWithId } from '../auth/decorators/user-exclusive.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.findById(id);
    return { message: 'User found with success!', user };
  }

  @Patch(':id')
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ExclusiveForUserWithId() //todo -> Testar funcionamento
    @LoggedUser()
    currentUser: UserEntity,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated with success!',
      user,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted with success!', id };
  }

  @IsPublic()
  @Get(':id/mail/confirm/:token')
  async confirmMail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
  ) {
    await this.usersService.confirmEmail(id, token);
    return { message: 'Email confirmed with success!' };
  }

  @Get(':id/mail/send')
  async sendConfirmationMail(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.sendConfirmationEmail(id);
    return { message: 'Email confirmed with success!' };
  }
}
