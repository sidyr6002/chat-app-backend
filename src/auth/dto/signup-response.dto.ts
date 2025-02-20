import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty()
  message: string;
}
