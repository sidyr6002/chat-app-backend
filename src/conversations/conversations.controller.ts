import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ConversationEntity } from './entity/conversation.entity';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import { DirectMessageDto } from './dto/direct-message.dto';

@Controller('conversations')
@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

  @Get('/all')
  async getAllConversations(@Req() req: RequestWithUser) {
    return this.conversationsService.getConversationsList(req.user.id);
  }

  @Get('/:conversationId/messages')
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number, default: 20 })
  @ApiOkResponse({
    schema: {
      properties: {
        messages: {
          type: 'array',
          items: {
            $ref: getSchemaPath(DirectMessageDto),
          },
        },
      },
    },
  })
  async getConversationMessages(
    @Req() req: RequestWithUser,
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor: string | undefined,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
  ) {
    console.log('Conversation id: ', conversationId);
    const { id } = req.user;

    return this.conversationsService.getConversationMessages(
      id,
      conversationId,
      cursor,
      take,
    );
  }

  @Post()
  @ApiOkResponse({ type: ConversationEntity })
  async createOrGetConversation(
    @Req() req: RequestWithUser,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const { participantEmail, participantUsername } = createConversationDto;

    let participant: User;

    if (participantEmail) {
      participant = await this.userService.findOne({
        email: participantEmail,
      });
    } else {
      participant = await this.userService.findOne({
        username: participantUsername,
      });
    }

    const currentUserId = req.user.id;
    const participantId = participant.id;

    console.log(
      `currentUserId: ${currentUserId}, participantId: ${participantId}`,
    );

    return this.conversationsService.createOrGetConversation(
      currentUserId,
      participantId,
    );
  }
}
