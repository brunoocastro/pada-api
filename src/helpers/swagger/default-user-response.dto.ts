import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../app/users/dto/user-response.dto';

export class DefaultUserResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  user: UserResponseDto;
}
