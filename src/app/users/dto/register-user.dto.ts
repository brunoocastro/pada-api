import { IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { RegExHelper } from '../../../helpers/regex.helper';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  birth: Date;

  picture: string;
}
