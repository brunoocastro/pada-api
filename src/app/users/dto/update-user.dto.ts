import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailStatus } from '@prisma/client';
import { IsEmpty, IsMobilePhone, IsOptional } from 'class-validator';
import { UserEntity } from '../entities/user.entity';

export class UpdateUserDto implements Partial<UserEntity> {
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @ApiPropertyOptional()
  picture?: string;

  @IsOptional()
  @IsMobilePhone(['pt-BR'])
  @ApiPropertyOptional()
  phone?: string;

  @IsEmpty()
  @ApiHideProperty()
  emailStatus?: EmailStatus;
}
