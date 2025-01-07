import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthEntity } from './entities/auth.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<AuthEntity> {
    try {
      const user = await this.userService.create(createUserDto);

      const accessToken = this.jwtService.sign({ userId: user.id });

      return { accessToken };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error during user signup');
    }
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

    const accessToken = this.jwtService.sign({ userId: user.id });

    return { accessToken };
  }
}
