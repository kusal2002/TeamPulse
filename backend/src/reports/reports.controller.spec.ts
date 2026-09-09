import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('ReportsController', () => {
  let controller: ReportsController;
  let mockReportsService: any;

  beforeEach(async () => {
    mockReportsService = {
      createDraft: vi.fn().mockResolvedValue({ id: 'r1', status: 'DRAFT' }),
      updateReport: vi.fn().mockResolvedValue({ id: 'r1', status: 'DRAFT' }),
      submitReport: vi.fn().mockResolvedValue({ id: 'r1', status: 'SUBMITTED' }),
      getUserReports: vi.fn().mockResolvedValue([{ id: 'r1' }]),
      getAllReports: vi.fn().mockResolvedValue([{ id: 'r1' }]),
      getReportById: vi.fn().mockResolvedValue({ id: 'r1' }),
      reviewReport: vi.fn().mockResolvedValue({ id: 'r1', status: 'APPROVED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createDraft when creating a report', async () => {
    const user = { id: 'user-1' };
    const dto: any = { weekStart: '2026-09-01', projectId: 'p1' };
    const res = await controller.create(user, dto);
    expect(res).toEqual({ id: 'r1', status: 'DRAFT' });
    expect(mockReportsService.createDraft).toHaveBeenCalledWith('user-1', dto);
  });
});
