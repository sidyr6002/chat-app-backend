import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description:
      'The ID of the participant with whom the conversation is to be created.',
  })
  participantId: string;
}
