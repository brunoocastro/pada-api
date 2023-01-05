import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { RegExHelper } from '../../../helpers/regex.helper';

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  oldPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  newPassword: string;
}
