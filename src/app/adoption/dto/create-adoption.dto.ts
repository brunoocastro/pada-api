import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genders, Prisma } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsEnum, IsJSON, IsNotEmpty, IsOptional } from 'class-validator';
import { AdoptionEntity } from '../entities/adoption.entity';

export class CreateAdoptionDto implements Partial<AdoptionEntity> {
  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  species: string;

  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  breed: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Expose()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional({ type: JSON })
  pictures: Prisma.JsonValue;

  @Expose()
  @IsNotEmpty()
  @IsEnum(Genders)
  @ApiProperty({ enum: Genders })
  gender: Genders;
}
