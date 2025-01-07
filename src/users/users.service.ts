import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.prismaService.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error during user signup');
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.prismaService.user.findMany();

    return users;
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = this.prismaService.user.update({
      where,
      data: updateUserDto,
    });

    return user;
  }

  async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = this.prismaService.user.delete({
      where,
    });

    return user;
  }
}
