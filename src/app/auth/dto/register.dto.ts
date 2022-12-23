import { IsNotEmpty, IsEmail, Matches, IsOptional } from 'class-validator';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { RegExHelper } from '../../../helpers/regex.helper';

export class UserRegisterDto {
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

  @IsOptional()
  picture: string;
}
