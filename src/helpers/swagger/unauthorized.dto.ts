import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedResponseDto {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
}
