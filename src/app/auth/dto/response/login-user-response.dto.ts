import { ApiProperty } from '@nestjs/swagger';
import { UserWithTokenResponseDto } from './user-with-token-response.dto';

export class LoginUserResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: UserWithTokenResponseDto })
  user: UserWithTokenResponseDto;
}
