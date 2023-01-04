import {
  IsNotEmpty,
  IsEmail,
  Matches,
  IsOptional,
  IsMobilePhone,
} from 'class-validator';
import { MessagesHelper } from '../../../helpers/messages.helper';
import { RegExHelper } from '../../../helpers/regex.helper';
import { UserEntity } from '../../users/entities/user.entity';

export class RegisterUserDto
  implements Pick<UserEntity, 'email' | 'password' | 'name' | 'picture'>
{
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  picture: string;

  @IsOptional()
  @IsMobilePhone(['pt-BR'])
  phone: string;
}
