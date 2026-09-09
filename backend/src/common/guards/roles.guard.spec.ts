import { RolesGuard } from './roles.guard.js';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockContext = (userRole?: string): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext('TEAM_MEMBER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has the required role (MANAGER)', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    const context = createMockContext('MANAGER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has one of the allowed roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['TEAM_MEMBER', 'MANAGER']);
    const context = createMockContext('TEAM_MEMBER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user does NOT have the required role (TEAM_MEMBER trying to access MANAGER route)', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    const context = createMockContext('TEAM_MEMBER');
    expect(guard.canActivate(context)).toBe(false);
  });
});
