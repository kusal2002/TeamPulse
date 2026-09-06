import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto } from './dto/report.dto.js';
@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Draft
  async createDraft(userId: string, dto: CreateReportDto) {
    const weekStart = new Date(dto.weekStart);

    return this.prisma.report.create({
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
            tasksCompleted: { create: dto.tasksCompleted },
            blockers: { create: dto.blockers },
            achievements: { create: dto.achievements },
            hoursWorked: { create: dto.hoursWorked },
          },
        },
      },
      include: { versions: true },
    });
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
          tasksCompleted: { create: dto.tasksCompleted },
          blockers: { create: dto.blockers },
          achievements: { create: dto.achievements },
          hoursWorked: { create: dto.hoursWorked },
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
          tasksCompleted: { create: dto.tasksCompleted },
          blockers: { create: dto.blockers },
          achievements: { create: dto.achievements },
          hoursWorked: { create: dto.hoursWorked },
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
