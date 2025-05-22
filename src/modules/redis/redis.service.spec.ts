// Mock ioredis BEFORE importing RedisService
jest.mock('ioredis', () => {
  const mockRedis = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(undefined),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  }));
  return { __esModule: true, default: mockRedis };
});

import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(async () => {});

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
