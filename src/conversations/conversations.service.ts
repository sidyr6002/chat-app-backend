import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new conversation or retrieves an existing one between two users.
   *
   * @param currentUserId - The ID of the current user initiating the conversation.
   * @param participantId - The ID of the participant with whom the conversation is to be created or retrieved.
   * @throws {Error} - Throws an error if the current user attempts to create a conversation with themselves.
   * @returns The existing or newly created conversation, including its messages.
   */
  async createOrGetConversation(currentUserId: string, participantId: string) {
    if (currentUserId === participantId) {
      throw new Error('You cannot create a conversation with yourself');
    }

    const [userId1, userId2] =
      currentUserId < participantId
        ? [currentUserId, participantId]
        : [participantId, currentUserId];

    const existingConversation =
      await this.prismaService.conversation.findUnique({
        where: {
          userId1_userId2: {
            userId1,
            userId2,
          },
        },
        include: {
          messages: true,
        },
      });

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation = await this.prismaService.conversation.create({
      data: {
        userId1,
        userId2,
      },
      include: {
        messages: true,
      },
    });

    return newConversation;
  }

  /**
   * Retrieves a specific conversation by its ID and ensures the current user is a participant.
   *
   * @param currentUserId - The ID of the current user requesting the conversation.
   * @param conversationId - The ID of the conversation to retrieve.
   * @throws {Error} - Throws an error if the conversation is not found or the user is not a participant.
   * @returns The conversation along with its messages if the user is a participant.
   */
  async getConversation(currentUserId: string, conversationId: string) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: true,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (
      currentUserId != conversation.userId1 &&
      currentUserId != conversation.userId2
    ) {
      throw new Error('You are not a participant in this conversation');
    }

    return conversation;
  }

  /**
   * Sends a direct message from the current user to the other participant in the given conversation.
   *
   * @param conversationId - The ID of the conversation in which the message is to be sent.
   * @param currentUserId - The ID of the current user sending the message.
   * @param content - The content of the message to be sent.
   * @throws {Error} - Throws an error if the conversation is not found or the user is not a participant.
   * @returns The newly created direct message object.
   */
  async sendMessage(
    conversationId: string,
    currentUserId: string,
    message: string,
  ) {
    const conversation = await this.getConversation(
      currentUserId,
      conversationId,
    );

    const receiverId =
      conversation.userId1 === currentUserId
        ? conversation.userId2
        : conversation.userId1;

    const directMessage = await this.prismaService.directMessage.create({
      data: {
        content: message,
        senderId: currentUserId,
        receiverId,
        conversationId,
      },
    });

    return directMessage;
  }
}
