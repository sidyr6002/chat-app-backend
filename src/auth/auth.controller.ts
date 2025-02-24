import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SingInDto } from './dto/signin-request.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { SignUpResponseDto } from './dto/signup-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthEntity } from './entities/auth.entity';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiCreatedResponse({ type: SignUpResponseDto })
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @ApiOkResponse({ type: AuthEntity })
  @Post('signin')
  async login(@Body() signInDto: SingInDto): Promise<AuthEntity> {
    const { accessToken, refreshToken } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    return { accessToken, refreshToken };
  }

  @ApiOkResponse({ type: AuthEntity })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthEntity> {
    const { refreshToken: oldRefreshToken } = refreshTokenDto;

    const { accessToken, refreshToken } =
      await this.authService.refresh(oldRefreshToken);

    return { accessToken, refreshToken };
  }
}
