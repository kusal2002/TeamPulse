import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('AiService', () => {
  let service: AiService;
  let mockPrismaService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockPrismaService = {
      report: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'r1',
            weekStart: new Date('2026-09-01'),
            status: 'SUBMITTED',
            user: { name: 'Alice', email: 'alice@example.com', role: 'TEAM_MEMBER' },
            project: { name: 'Alpha' },
            versions: [
              {
                versionNumber: 1,
                tasksCompleted: [{ taskName: 'Task 1', status: 'Done', timeSpent: 4, priority: 'High' }],
                blockers: [{ description: 'API rate limit', isKeyIssue: true }],
                achievements: [{ description: 'Shipped v1', isKeyHighlight: true }],
                tasksPlannedNext: 'Build feature X',
              },
            ],
            comments: [],
          },
        ]),
      },
    };

    mockConfigService = {
      get: vi.fn().mockReturnValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate an AI response based on team context', async () => {
    const response = await service.askAi('Summarize blockers for this week');
    expect(response).toBeDefined();
    expect(response).toContain('Blockers');
  });
});
