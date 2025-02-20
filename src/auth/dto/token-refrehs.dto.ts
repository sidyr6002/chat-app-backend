import { ApiProperty } from '@nestjs/swagger';

export class TokenRefreshDto {
  @ApiProperty()
  refreshToken: string;
}
