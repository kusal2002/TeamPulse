import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockProjectsService: any;

  beforeEach(async () => {
    mockProjectsService = {
      findAll: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Project A' }]),
      create: vi.fn().mockImplementation((name, desc) =>
        Promise.resolve({ id: 'p2', name, description: desc }),
      ),
      update: vi.fn().mockImplementation((id, name, desc) =>
        Promise.resolve({ id, name, description: desc }),
      ),
      remove: vi.fn().mockImplementation((id) => Promise.resolve({ id })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all projects', async () => {
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
    expect(mockProjectsService.findAll).toHaveBeenCalled();
  });

  it('should create a project', async () => {
    const result = await controller.create({
      name: 'Project B',
      description: 'Desc B',
    });
    expect(result).toEqual({ id: 'p2', name: 'Project B', description: 'Desc B' });
    expect(mockProjectsService.create).toHaveBeenCalledWith('Project B', 'Desc B');
  });

  it('should update a project', async () => {
    const result = await controller.update('p1', {
      name: 'Project Updated',
      description: 'Desc Updated',
    });
    expect(result).toEqual({
      id: 'p1',
      name: 'Project Updated',
      description: 'Desc Updated',
    });
  });

  it('should delete a project', async () => {
    const result = await controller.delete('p1');
    expect(result).toEqual({ id: 'p1' });
    expect(mockProjectsService.remove).toHaveBeenCalledWith('p1');
  });
});
