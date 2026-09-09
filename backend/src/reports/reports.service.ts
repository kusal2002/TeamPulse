import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto } from './dto/report.dto.js';
function sanitizeTasks(tasks: any[]) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(({ id, reportVersionId, ...rest }) => ({
    taskName: rest.taskName || '',
    priority: rest.priority || 'Medium',
    plannedPercent: Number(rest.plannedPercent) || 0,
    actualPercent: Number(rest.actualPercent) || 0,
    status: rest.status || 'In Progress',
    timePlanned: Number(rest.timePlanned) || 0,
    timeSpent: Number(rest.timeSpent) || 0,
    deliverable: rest.deliverable || '',
  }));
}

function sanitizeBlockers(blockers: any[]) {
  if (!Array.isArray(blockers)) return [];
  return blockers.map(({ id, reportVersionId, ...rest }) => ({
    description: rest.description || '',
    isKeyIssue: Boolean(rest.isKeyIssue),
  }));
}

function sanitizeAchievements(achievements: any[]) {
  if (!Array.isArray(achievements)) return [];
  return achievements.map(({ id, reportVersionId, ...rest }) => ({
    description: rest.description || '',
    isKeyHighlight: Boolean(rest.isKeyHighlight),
  }));
}

function sanitizeHours(hours: any[]) {
  if (!Array.isArray(hours)) return [];
  return hours.map(({ id, reportVersionId, ...rest }) => ({
    taskType: rest.taskType || 'Development',
    hours: Number(rest.hours) || 0,
  }));
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Draft
  async createDraft(userId: string, dto: CreateReportDto) {
    const weekStart = new Date(dto.weekStart);

    // Check if a report for this user and weekStart already exists
    const existing = await this.prisma.report.findUnique({
      where: {
        userId_weekStart: {
          userId,
          weekStart,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A report already exists for the week starting ${weekStart.toISOString().split('T')[0]}. Please edit your existing report instead.`,
      );
    }

    try {
      return await this.prisma.report.create({
        data: {
          userId,
          projectId: dto.projectId,
          weekStart,
          status: 'DRAFT',
          versions: {
            create: {
              versionNumber: 1,
              tasksPlannedNext: dto.tasksPlannedNext,
              optionalNotes: dto.optionalNotes,
              tasksCompleted: { create: sanitizeTasks(dto.tasksCompleted) },
              blockers: { create: sanitizeBlockers(dto.blockers) },
              achievements: { create: sanitizeAchievements(dto.achievements) },
              hoursWorked: { create: sanitizeHours(dto.hoursWorked) },
            },
          },
        },
        include: { versions: true },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `A report already exists for the week starting ${weekStart.toISOString().split('T')[0]}. Please edit your existing report instead.`,
        );
      }
      throw error;
    }
  }

  // 2. Update Draft / Save Correction
  async updateReport(id: string, userId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException();
    if (report.userId !== userId)
      throw new ForbiddenException('Not your report');

    if (report.status !== 'DRAFT' && report.status !== 'NEEDS_CORRECTION') {
      throw new BadRequestException(
        'Can only edit drafts or reports needing correction',
      );
    }

    // Update report metadata if changed
    if (dto.projectId || dto.weekStart) {
      const updateData: any = {};
      if (dto.projectId) updateData.projectId = dto.projectId;
      if (dto.weekStart) updateData.weekStart = new Date(dto.weekStart);
      await this.prisma.report.update({
        where: { id },
        data: updateData,
      });
    }

    // Find the latest version
    const latestVersion = await this.prisma.reportVersion.findFirst({
      where: { reportId: id },
      orderBy: { versionNumber: 'desc' },
    });

    // If it's a correction, we MUST create a new version to preserve history
    if (report.status === 'NEEDS_CORRECTION') {
      await this.prisma.reportVersion.create({
        data: {
          reportId: id,
          versionNumber: latestVersion!.versionNumber + 1,
          tasksPlannedNext: dto.tasksPlannedNext,
          optionalNotes: dto.optionalNotes,
          tasksCompleted: { create: sanitizeTasks(dto.tasksCompleted) },
          blockers: { create: sanitizeBlockers(dto.blockers) },
          achievements: { create: sanitizeAchievements(dto.achievements) },
          hoursWorked: { create: sanitizeHours(dto.hoursWorked) },
        },
      });
    } else {
      // If it's just a draft, update the existing version
      // Delete old nested items and recreate them (simplest approach for fixed structures)
      await this.prisma.$transaction([
        this.prisma.taskCompleted.deleteMany({
          where: { reportVersionId: latestVersion!.id },
        }),
        this.prisma.blocker.deleteMany({
          where: { reportVersionId: latestVersion!.id },
        }),
        this.prisma.achievement.deleteMany({
          where: { reportVersionId: latestVersion!.id },
        }),
        this.prisma.hoursWorked.deleteMany({
          where: { reportVersionId: latestVersion!.id },
        }),
      ]);

      await this.prisma.reportVersion.update({
        where: { id: latestVersion!.id },
        data: {
          tasksPlannedNext: dto.tasksPlannedNext,
          optionalNotes: dto.optionalNotes,
          tasksCompleted: { create: sanitizeTasks(dto.tasksCompleted) },
          blockers: { create: sanitizeBlockers(dto.blockers) },
          achievements: { create: sanitizeAchievements(dto.achievements) },
          hoursWorked: { create: sanitizeHours(dto.hoursWorked) },
        },
      });
    }

    return this.getReportDetail(id, userId);
  }

  // 3. Submit for Review
  async submitReport(id: string, userId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException();
    if (report.userId !== userId) throw new ForbiddenException();
    if (report.status === 'APPROVED')
      throw new BadRequestException('Cannot resubmit approved report');

    return this.prisma.report.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });
  }

  // 4. Get Own History
  async getMyHistory(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
      include: {
        project: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
        // The latest review comment powers the "Reviewer" column in the
        // member's report history table.
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { manager: { select: { id: true, name: true } } },
        },
      },
    });
  }

  // 5. Get Full Detail (with all versions and comments)
  async getReportDetail(id: string, userId: string, isManager = false) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            tasksCompleted: true,
            blockers: true,
            achievements: true,
            hoursWorked: true,
            reviewComments: true, // Shows which comments belong to which version
          },
        },
        comments: {
          include: { manager: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!report) throw new NotFoundException();
    if (!isManager && report.userId !== userId) throw new ForbiddenException();

    return report;
  }

  // --- MANAGER ENDPOINTS ---

  // 6. Get All Reports (with filters)
  async getAllReports(filters: {
    weekStart?: string;
    userId?: string;
    projectId?: string;
    status?: string;
  }) {
    const where: any = {};
    if (filters.weekStart) where.weekStart = new Date(filters.weekStart);
    if (filters.userId) where.userId = filters.userId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;

    return this.prisma.report.findMany({
      where,
      orderBy: { weekStart: 'desc' },
      include: { user: true, project: true },
    });
  }

  // 7. Manager Review Action
  async reviewReport(
    id: string,
    managerId: string,
    action: 'APPROVED' | 'REQUESTED_CHANGES',
    comment?: string,
  ) {
    if (action === 'REQUESTED_CHANGES' && !comment) {
      throw new BadRequestException(
        'Comment is required when requesting changes',
      );
    }

    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException();
    if (report.status !== 'SUBMITTED')
      throw new BadRequestException('Report is not pending review');

    // Get the latest version to link the comment to it
    const latestVersion = await this.prisma.reportVersion.findFirst({
      where: { reportId: id },
      orderBy: { versionNumber: 'desc' },
    });

    return this.prisma.$transaction([
      // Update report status
      this.prisma.report.update({
        where: { id },
        data: {
          status: action === 'APPROVED' ? 'APPROVED' : 'NEEDS_CORRECTION',
        },
      }),
      // Create the review comment linked to the specific version
      this.prisma.reviewComment.create({
        data: {
          reportId: id,
          reportVersionId: latestVersion!.id,
          managerId,
          action,
          comment: comment || 'Approved',
        },
      }),
    ]);
  }
}
