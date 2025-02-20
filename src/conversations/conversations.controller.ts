import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ConversationEntity } from './enitity/conversation.entity';

@Controller('conversations')
@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOkResponse({ type: ConversationEntity })
  async createOrGetConversation(
    @Req() req: RequestWithUser,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    try {
      const currentUserId = req.user.id;

      return this.conversationsService.createOrGetConversation(
        currentUserId,
        createConversationDto.participantId,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
