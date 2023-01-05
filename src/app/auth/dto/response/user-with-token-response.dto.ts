import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../users/dto/response/user-response.dto';

export class UserWithTokenResponseDto extends UserResponseDto {
  @ApiProperty()
  token: string;
}
