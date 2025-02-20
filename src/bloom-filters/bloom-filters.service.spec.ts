import { Test, TestingModule } from '@nestjs/testing';
import { BloomFiltersService } from './bloom-filters.service';

describe('BloomFiltersService', () => {
  let service: BloomFiltersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BloomFiltersService],
    }).compile();

    service = module.get<BloomFiltersService>(BloomFiltersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
