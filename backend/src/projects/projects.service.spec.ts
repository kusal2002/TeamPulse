import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      project: {
        findMany: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Project Alpha' }]),
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'p2', ...args.data }),
        ),
        update: vi.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        delete: vi.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id }),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all projects', async () => {
    const projects = await service.findAll();
    expect(projects).toHaveLength(1);
    expect(mockPrismaService.project.findMany).toHaveBeenCalled();
  });

  it('should create a project', async () => {
    const res = await service.create('New Project', 'Desc');
    expect(res).toEqual({ id: 'p2', name: 'New Project', description: 'Desc' });
    expect(mockPrismaService.project.create).toHaveBeenCalledWith({
      data: { name: 'New Project', description: 'Desc' },
    });
  });

  it('should update a project', async () => {
    const res = await service.update('p1', 'Updated Name');
    expect(res.name).toBe('Updated Name');
    expect(mockPrismaService.project.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { name: 'Updated Name', description: undefined },
    });
  });

  it('should remove a project', async () => {
    const res = await service.remove('p1');
    expect(res).toEqual({ id: 'p1' });
    expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
  });
});
