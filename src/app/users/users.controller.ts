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
  async getUser(@ExclusiveForUserWithId() id: string) {
    const user = await this.usersService.findById(id);
    return { message: 'User found with success!', user };
  }

  @Patch(':id')
  async updateUser(
    @ExclusiveForUserWithId() id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated with success!',
      user,
    };
  }

  @Patch(':id/password')
  async updateUserPassword(
    @ExclusiveForUserWithId() id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
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

  @Delete(':id')
  async deleteUser(@ExclusiveForUserWithId() id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted with success!', id };
  }

  @IsPublic()
  @Get(':id/mail/confirm/:token')
  async confirmAccountByMail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
  ) {
    const updatedUser = await this.usersService.confirmAccountWithToken(
      id,
      token,
    );
    return { message: 'Email confirmed with success!', user: updatedUser };
  }

  @Get(':id/mail/send')
  async sendAccountConfirmationMail(@ExclusiveForUserWithId() id: string) {
    const updatedUser = await this.usersService.sendUserConfirmationMailById(
      id,
    );
    return {
      message:
        'Confirmation mail sended with success! Access your account and confirm your account.',
      user: updatedUser,
    };
  }
}
