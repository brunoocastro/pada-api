import { IsNotEmpty, Matches } from 'class-validator';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { RegExHelper } from '../../../helpers/regex.helper';

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  newPassword: string;
}
