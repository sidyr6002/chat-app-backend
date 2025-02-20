import { Test, TestingModule } from '@nestjs/testing';
import { BloomFiltersController } from './bloom-filters.controller';

describe('BloomFiltersController', () => {
  let controller: BloomFiltersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloomFiltersController],
    }).compile();

    controller = module.get<BloomFiltersController>(BloomFiltersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
