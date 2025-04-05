import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserEntity(user));
  }

  @Get('/me')
  @ApiOkResponse({ type: UserEntity })
  async findOneById(@Req() req: RequestWithUser) {
    const { id } = req.user;

    console.log('User id: ', id);

    const user = await this.usersService.findOne({ id });
    return new UserEntity(user);
  }

  @Get('email/:email')
  @ApiOkResponse({ type: UserEntity })
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.usersService.findOne({ email });
    return new UserEntity(user);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: UserEntity })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update({ id }, updateUserDto);
    return new UserEntity(user);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove({ id });
    return new UserEntity(user);
  }
}
