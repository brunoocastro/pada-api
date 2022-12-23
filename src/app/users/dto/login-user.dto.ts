import { IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { RegExHelper } from '../../../helpers/regex.helper';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  password: string;
}
