import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'The message content to send in the conversation',
  })
  message: string;
}
