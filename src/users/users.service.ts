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
import { BloomFiltersService } from 'src/bloom-filters/bloom-filters.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bloomFiltersService: BloomFiltersService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    if (!user) {
      throw new InternalServerErrorException('Error creating user');
    }

    this.bloomFiltersService.addUsername(user.username);

    return user;
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
