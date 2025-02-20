import { Controller, Get, Query } from '@nestjs/common';
import { BloomFiltersService } from './bloom-filters.service';
import { ApiResponse } from '@nestjs/swagger';
import { UsernameAvailabilityDto } from './dto/username-availability.dto';
import { UsernameCheckDto } from './dto/username-check.dto';

@Controller('usernames')
export class BloomFiltersController {
  constructor(private readonly bloomFiltersService: BloomFiltersService) {}

  @Get('check-availability')
  @ApiResponse({ type: UsernameAvailabilityDto })
  isValidUsername(@Query() { username }: UsernameCheckDto) {
    const isAvailable =
      this.bloomFiltersService.checkUsernameAvailability(username);

    return {
      username,
      isAvailable,
    };
  }
}
