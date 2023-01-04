import { Test, TestingModule } from '@nestjs/testing';
import { AdoptionRepository } from '../repository/adoption.repository';
import { AdoptionService } from './adoption.service';

describe('AdoptionService', () => {
  let service: AdoptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdoptionService,
        {
          provide: AdoptionRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findAllPerUser: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdoptionService>(AdoptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
