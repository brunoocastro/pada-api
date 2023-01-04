import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, { message: MessagesHelper.InvalidPassword })
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiPropertyOptional()
  picture: string;

  @IsOptional()
  @IsMobilePhone(['pt-BR'])
  @ApiPropertyOptional()
  phone: string;
}
