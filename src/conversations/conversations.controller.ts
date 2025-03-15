import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ConversationEntity } from './entity/conversation.entity';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';

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
