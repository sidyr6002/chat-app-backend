//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/users/entities/user.entity';

interface JwtPayload {
  userId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    try {
      const user = await this.usersService.findOne({ id: payload.userId });

      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }

      return new UserEntity(user);
    } catch (error) {
      console.error(`Error validating JWT: ${error}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
