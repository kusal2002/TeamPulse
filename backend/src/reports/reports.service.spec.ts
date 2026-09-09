import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('ReportsService - RBAC & Data Protection Tests', () => {
  let service: ReportsService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      report: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      reportVersion: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      taskCompleted: { deleteMany: vi.fn() },
      blocker: { deleteMany: vi.fn() },
      achievement: { deleteMany: vi.fn() },
      hoursWorked: { deleteMany: vi.fn() },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('RBAC & Resource Ownership Access Controls', () => {
    it('should throw ForbiddenException if a TEAM_MEMBER tries to update another user report', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        id: 'r1',
        userId: 'user-owner',
        status: 'DRAFT',
      });

      await expect(
        service.updateReport('r1', 'user-attacker', {
          weekStart: '2026-09-01',
          projectId: 'p1',
          tasksPlannedNext: 'Plan',
          tasksCompleted: [],
          blockers: [],
          achievements: [],
          hoursWorked: [],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if a TEAM_MEMBER attempts to view another user report details', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        id: 'r1',
        userId: 'user-owner',
        status: 'SUBMITTED',
      });

      await expect(
        service.getReportDetail('r1', 'user-attacker', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should ALLOW a MANAGER to view any team member report details (isManager = true)', async () => {
      const mockReport = {
        id: 'r1',
        userId: 'user-owner',
        status: 'SUBMITTED',
      };
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      const result = await service.getReportDetail('r1', 'manager-user-id', true);
      expect(result).toEqual(mockReport);
    });
  });

  describe('Report Status & Workflow Rules', () => {
    it('should throw BadRequestException if editing an APPROVED report', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        id: 'r1',
        userId: 'user-owner',
        status: 'APPROVED',
      });

      await expect(
        service.updateReport('r1', 'user-owner', {
          weekStart: '2026-09-01',
          projectId: 'p1',
          tasksPlannedNext: 'Plan',
          tasksCompleted: [],
          blockers: [],
          achievements: [],
          hoursWorked: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a draft report when no report exists for the week', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);
      mockPrismaService.report.create.mockResolvedValue({
        id: 'r1',
        userId: 'user-1',
        status: 'DRAFT',
      });

      const result = await service.createDraft('user-1', {
        weekStart: '2026-09-01',
        projectId: 'p1',
        tasksPlannedNext: 'Tasks planned',
        tasksCompleted: [],
        blockers: [],
        achievements: [],
        hoursWorked: [],
      });

      expect(result).toEqual({ id: 'r1', userId: 'user-1', status: 'DRAFT' });
      expect(mockPrismaService.report.create).toHaveBeenCalled();
    });
  });
});
