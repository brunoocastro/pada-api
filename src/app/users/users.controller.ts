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
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { ExclusiveForUserWithId } from '../auth/decorators/user-exclusive.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.findById(id);
    return { message: 'User found with success!', user };
  }

  @Patch(':id/password')
  async updateUserPassword(
    // @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @ExclusiveForUserWithId() id: string, //todo -> Testar funcionamento
  ) {
    const user = await this.usersService.updatePassword(
      id,
      updateUserPasswordDto,
    );
    return {
      message: 'User password updated with success!',
      user,
    };
  }
  @Patch(':id')
  async updateUser(
    // @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ExclusiveForUserWithId() id: string, //todo -> Testar funcionamento
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
