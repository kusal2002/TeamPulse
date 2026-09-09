import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    email: string,
    password: string,
    name: string,
    role: 'TEAM_MEMBER' | 'MANAGER' = 'TEAM_MEMBER',
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { email, passwordHash, name, role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      reportCount: u._count.reports,
    }));
  }

  async getUserProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        reports: {
          orderBy: { weekStart: 'desc' },
          include: {
            project: true,
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
              include: {
                tasksCompleted: true,
                blockers: true,
                achievements: true,
                hoursWorked: true,
              },
            },
            comments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { manager: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Aggregate statistics
    const totalReports = user.reports.length;
    const approvedReports = user.reports.filter((r) => r.status === 'APPROVED').length;
    const needsCorrectionReports = user.reports.filter((r) => r.status === 'NEEDS_CORRECTION').length;
    const submittedReports = user.reports.filter((r) => r.status === 'SUBMITTED').length;
    const draftReports = user.reports.filter((r) => r.status === 'DRAFT').length;

    let totalHoursLogged = 0;
    let openBlockersCount = 0;

    user.reports.forEach((r) => {
      const latestVer = r.versions[0];
      if (latestVer) {
        latestVer.hoursWorked.forEach((hw) => {
          totalHoursLogged += hw.hours || 0;
        });
        latestVer.blockers.forEach((b) => {
          if (b.isKeyIssue) openBlockersCount += 1;
        });
      }
    });

    const complianceRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 100;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        totalReports,
        approvedReports,
        submittedReports,
        needsCorrectionReports,
        draftReports,
        totalHoursLogged,
        openBlockersCount,
        complianceRate,
      },
      reports: user.reports,
    };
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async removeUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, name: true },
    });
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new ConflictException('Email address already in use');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updatePassword(
    userId: string,
    data: { currentPassword?: string; newPassword?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!data.currentPassword || !data.newPassword) {
      throw new BadRequestException('Both current and new password are required');
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ForbiddenException('Incorrect current password');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }
}
