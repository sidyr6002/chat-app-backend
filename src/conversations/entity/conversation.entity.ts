import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Conversation, DirectMessage } from '@prisma/client';

export class ConversationEntity implements Conversation {
  constructor(partial: Partial<ConversationEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  userId1: string;

  @ApiProperty()
  userId2: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  messages: DirectMessage[];

  @ApiHideProperty()
  lastMessageId: string;
}
