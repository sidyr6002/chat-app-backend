import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ type: AuthEntity })
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto): Promise<AuthEntity> {
    return this.authService.signUp(createUserDto);
  }

  @ApiOkResponse({ type: AuthEntity })
  @Post('signin')
  login(@Body() loginDto: LoginDto): Promise<AuthEntity> {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }
}
