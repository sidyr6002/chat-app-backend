import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthEntity } from './entities/auth.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);

    return { message: 'User created successfully' };
  }

  async signIn(email: string, password: string): Promise<AuthEntity> {
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new NotFoundException(`User with email:${email} is not found`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { userId: user.id };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(oldToken: string): Promise<AuthEntity> {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { token: oldToken },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userService.findOne({ id: refreshToken.userId });

    if (!user) {
      throw new NotFoundException(
        `User with id:${refreshToken.userId} not found`,
      );
    }

    const payload = { userId: user.id };

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.prismaService.refreshToken.update({
      where: { id: refreshToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const newAccessToken = this.jwtService.sign(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
