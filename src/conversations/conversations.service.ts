import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
  ) {}

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
      throw new BadRequestException(
        'You cannot create a conversation with yourself',
      );
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
   * Retrieves a list of conversations for the current user.
   *
   * @param currentUserId - The ID of the current user whose conversations are to be retrieved.
   * @throws {Error} - Throws an error if no conversations are found for the user.
   * @returns An array of conversations, each including the other participant and last message details.
   */
  async getConversationsList(currentUserId: string) {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        OR: [
          {
            userId1: currentUserId,
          },
          {
            userId2: currentUserId,
          },
        ],
      },
      include: {
        user1: true,
        user2: true,
        lastMessage: true,
      },
    });

    if (!conversations) {
      throw new Error('Conversations not found');
    }

    return conversations.map(({ user1, user2, userId1, userId2, ...rest }) => {
      void userId2;

      return {
        ...rest,
        participant: new UserEntity(userId1 === currentUserId ? user2 : user1),
      };
    });
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

  async getConversationsListWithLastMessage(currentUserId: string) {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        OR: [
          {
            userId1: currentUserId,
          },
          {
            userId2: currentUserId,
          },
        ],
      },
      include: {
        lastMessage: true,
        user1: true,
        user2: true,
      },
      orderBy: {
        lastMessage: {
          createdAt: 'desc',
        },
      },
    });

    return conversations.map((conversation) => {
      const otherParticipant =
        conversation.userId1 === currentUserId
          ? conversation.user2
          : conversation.user1;

      return {
        conversationId: conversation.id,
        participant: otherParticipant,
        lastMessage: conversation.lastMessage,
        createdAt: conversation.createdAt,
      };
    });
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

    await this.prismaService.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessage: {
          connect: {
            id: directMessage.id,
          },
        },
      },
    });

    return directMessage;
  }
}
