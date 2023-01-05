import { ApiProperty } from '@nestjs/swagger';
import { EmailStatus, Role } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from '../../entities/user.entity';

export class UserResponseDto implements Partial<UserEntity> {
  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({ enum: EmailStatus })
  emailStatus: EmailStatus;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({ enum: Role })
  role: Role;
}
