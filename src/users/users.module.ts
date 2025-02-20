import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BloomFiltersModule } from 'src/bloom-filters/bloom-filters.module';

@Module({
  imports: [PrismaModule, BloomFiltersModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
