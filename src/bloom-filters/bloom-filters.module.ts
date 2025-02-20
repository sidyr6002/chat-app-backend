import { Module } from '@nestjs/common';
import { BloomFiltersService } from './bloom-filters.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BloomFiltersController } from './bloom-filters.controller';

@Module({
  imports: [PrismaModule],
  providers: [BloomFiltersService],
  exports: [BloomFiltersService],
  controllers: [BloomFiltersController],
})
export class BloomFiltersModule {}
