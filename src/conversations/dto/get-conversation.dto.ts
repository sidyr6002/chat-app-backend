import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetConversationDto {
  @ApiProperty()
  @IsNotEmpty()
  currentUserId: string;
}
