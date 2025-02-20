import { ApiProperty } from '@nestjs/swagger';

export class UsernameAvailabilityDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  isAvailable: boolean;
}
