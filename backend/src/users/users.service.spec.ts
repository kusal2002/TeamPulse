import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'u1',
            email: 'user1@example.com',
            name: 'User 1',
            role: 'TEAM_MEMBER',
            createdAt: new Date(),
            _count: { reports: 3 },
          },
        ]),
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'u2', ...args.data }),
        ),
        update: vi.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        delete: vi.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, email: 'u1@example.com', name: 'User 1' }),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users with report counts', async () => {
    const users = await service.findAll();
    expect(users).toHaveLength(1);
    expect(users[0].reportCount).toBe(3);
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
  });

  it('should update a user role', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEAM_MEMBER' });
    const updated = await service.updateRole('u1', 'MANAGER');
    expect(updated.role).toBe('MANAGER');
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { role: 'MANAGER' },
      select: expect.any(Object),
    });
  });

  it('should delete a user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'u1' });
    const result = await service.removeUser('u1');
    expect(result.id).toBe('u1');
    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: expect.any(Object),
    });
  });
});
