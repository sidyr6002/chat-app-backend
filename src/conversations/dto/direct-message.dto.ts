import { DirectMessage } from '@prisma/client';

export class DirectMessageDto implements DirectMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}
