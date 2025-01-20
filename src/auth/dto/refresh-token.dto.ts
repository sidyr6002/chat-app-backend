import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Refresh token cannot be empty' })
  @IsString()
  refreshToken: string;
}
