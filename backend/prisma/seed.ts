import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting TeamPulse database seeding...');

  // 1. Clean up existing data in reverse order of dependencies
  await prisma.reviewComment.deleteMany();
  await prisma.taskCompleted.deleteMany();
  await prisma.blocker.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.hoursWorked.deleteMany();
  await prisma.reportVersion.deleteMany();
  await prisma.report.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Hash passwords
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Create Users (1 Manager + 4 Team Members)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@teampulse.com',
      name: 'Sarah Connor',
      role: 'MANAGER',
      passwordHash,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'alex@teampulse.com',
      name: 'Alex Mercer',
      role: 'TEAM_MEMBER',
      passwordHash,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'elena@teampulse.com',
      name: 'Elena Rostova',
      role: 'TEAM_MEMBER',
      passwordHash,
    },
  });

  const member3 = await prisma.user.create({
    data: {
      email: 'david@teampulse.com',
      name: 'David Chen',
      role: 'TEAM_MEMBER',
      passwordHash,
    },
  });

  const member4 = await prisma.user.create({
    data: {
      email: 'maya@teampulse.com',
      name: 'Maya Patel',
      role: 'TEAM_MEMBER',
      passwordHash,
    },
  });

  console.log('👥 Created 5 users (1 Manager, 4 Team Members).');

  // 4. Create Projects
  const projectA = await prisma.project.create({
    data: {
      name: 'Client A Portal',
      description: 'Enterprise customer dashboard & Next.js portal migration',
      managers: { connect: [{ id: manager.id }] },
      members: { connect: [{ id: member1.id }, { id: member2.id }] },
    },
  });

  const projectB = await prisma.project.create({
    data: {
      name: 'Internal Tooling',
      description: 'DevOps automation and TeamPulse management analytics',
      managers: { connect: [{ id: manager.id }] },
      members: { connect: [{ id: member3.id }] },
    },
  });

  const projectC = await prisma.project.create({
    data: {
      name: 'Mobile App R&D',
      description: 'React Native iOS/Android cross-platform research and prototyping',
      managers: { connect: [{ id: manager.id }] },
      members: { connect: [{ id: member4.id }] },
    },
  });

  const projectD = await prisma.project.create({
    data: {
      name: 'Marketing Platform',
      description: 'Public website overhaul & SEO tracking pipeline',
      managers: { connect: [{ id: manager.id }] },
      members: { connect: [{ id: member1.id }, { id: member4.id }] },
    },
  });

  console.log('📁 Created 4 projects.');

  // Dates for 4 consecutive report weeks (Mondays)
  const week1 = new Date('2026-08-10T00:00:00.000Z');
  const week2 = new Date('2026-08-17T00:00:00.000Z');
  const week3 = new Date('2026-08-24T00:00:00.000Z');
  const week4 = new Date('2026-09-01T00:00:00.000Z');

  // Helper to create report with full fixed-structure fields
  async function createFullReport(params: {
    userId: string;
    projectId: string;
    weekStart: Date;
    status: 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED';
    versionsData: Array<{
      versionNumber: number;
      submittedAt?: Date;
      tasksPlannedNext: string;
      optionalNotes?: string;
      tasksCompleted: Array<{
        taskName: string;
        priority: 'High' | 'Medium' | 'Low';
        plannedPercent: number;
        actualPercent: number;
        status: 'Done' | 'In Progress' | 'Blocked';
        timePlanned: number;
        timeSpent: number;
        deliverable?: string;
      }>;
      blockers: Array<{ description: string; isKeyIssue?: boolean }>;
      achievements: Array<{ description: string; isKeyHighlight?: boolean }>;
      hoursWorked: Array<{ taskType: string; hours: number }>;
      reviewComment?: {
        action: 'APPROVED' | 'REQUESTED_CHANGES';
        comment: string;
        createdAt?: Date;
      };
    }>;
  }) {
    const report = await prisma.report.create({
      data: {
        userId: params.userId,
        projectId: params.projectId,
        weekStart: params.weekStart,
        status: params.status,
      },
    });

    for (const vData of params.versionsData) {
      const version = await prisma.reportVersion.create({
        data: {
          reportId: report.id,
          versionNumber: vData.versionNumber,
          submittedAt: vData.submittedAt || new Date(),
          tasksPlannedNext: vData.tasksPlannedNext,
          optionalNotes: vData.optionalNotes || null,
          tasksCompleted: {
            create: vData.tasksCompleted.map((t) => ({
              taskName: t.taskName,
              priority: t.priority,
              plannedPercent: t.plannedPercent,
              actualPercent: t.actualPercent,
              status: t.status,
              timePlanned: t.timePlanned,
              timeSpent: t.timeSpent,
              deliverable: t.deliverable || null,
            })),
          },
          blockers: {
            create: vData.blockers.map((b) => ({
              description: b.description,
              isKeyIssue: Boolean(b.isKeyIssue),
            })),
          },
          achievements: {
            create: vData.achievements.map((a) => ({
              description: a.description,
              isKeyHighlight: Boolean(a.isKeyHighlight),
            })),
          },
          hoursWorked: {
            create: vData.hoursWorked.map((h) => ({
              taskType: h.taskType,
              hours: h.hours,
            })),
          },
        },
      });

      if (vData.reviewComment) {
        await prisma.reviewComment.create({
          data: {
            reportId: report.id,
            reportVersionId: version.id,
            managerId: manager.id,
            action: vData.reviewComment.action,
            comment: vData.reviewComment.comment,
            createdAt: vData.reviewComment.createdAt || new Date(),
          },
        });
      }
    }
  }

  // --- SEED REPORTS FOR WEEK 1 (Aug 10, 2026) ---
  await createFullReport({
    userId: member1.id,
    projectId: projectA.id,
    weekStart: week1,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-14T17:00:00Z'),
        tasksPlannedNext: 'Implement OAuth authentication & role middleware.',
        optionalNotes: 'All client portal API endpoints are fully documented on Swagger.',
        tasksCompleted: [
          {
            taskName: 'JWT Auth Service Architecture',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 16,
            timeSpent: 18,
            deliverable: 'https://github.com/teampulse/backend/pull/12',
          },
          {
            taskName: 'User Profile Schema Migration',
            priority: 'Medium',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 8,
            timeSpent: 7,
            deliverable: 'Prisma migration script v1.0',
          },
        ],
        blockers: [
          {
            description: 'Staging environment database connection latency spikes.',
            isKeyIssue: true,
          },
        ],
        achievements: [
          {
            description: 'Completed JWT token refresh rotation mechanism with zero security vulnerabilities.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 25 },
          { taskType: 'Testing', hours: 8 },
          { taskType: 'Meetings', hours: 4 },
          { taskType: 'Documentation', hours: 3 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Great work on the auth architecture and Prisma migrations. Approved!',
          createdAt: new Date('2026-08-15T09:30:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member2.id,
    projectId: projectA.id,
    weekStart: week1,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-14T16:30:00Z'),
        tasksPlannedNext: 'Design responsive navigation sidebar & team dashboard charts.',
        optionalNotes: 'Shadcn UI component kit successfully integrated into Next.js App Router.',
        tasksCompleted: [
          {
            taskName: 'Design System & Theme Provider',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 19,
            deliverable: 'https://github.com/teampulse/frontend/pull/4',
          },
          {
            taskName: 'Dark Mode Glassmorphism Tokens',
            priority: 'Medium',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 10,
            timeSpent: 10,
            deliverable: 'Tailwind CSS utility tokens',
          },
        ],
        blockers: [
          {
            description: 'Safari desktop layout rendering bug with CSS grid columns.',
            isKeyIssue: false,
          },
        ],
        achievements: [
          {
            description: 'Delivered sleek dark mode UI design system ahead of schedule.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 22 },
          { taskType: 'Testing', hours: 6 },
          { taskType: 'Meetings', hours: 5 },
          { taskType: 'Documentation', hours: 4 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'UI aesthetics look stunning. Excellent progress!',
          createdAt: new Date('2026-08-15T10:00:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member3.id,
    projectId: projectB.id,
    weekStart: week1,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-14T18:00:00Z'),
        tasksPlannedNext: 'Setup Docker containerization and Github Actions CI/CD.',
        tasksCompleted: [
          {
            taskName: 'Neon PostgreSQL Connection Pooling',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 15,
            timeSpent: 14,
            deliverable: 'Prisma @prisma/adapter-pg setup',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Reduced API database query latency by 40% using connection pooler.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 24 },
          { taskType: 'Testing', hours: 8 },
          { taskType: 'Meetings', hours: 3 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Performance gains look solid.',
          createdAt: new Date('2026-08-15T11:00:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member4.id,
    projectId: projectC.id,
    weekStart: week1,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-14T17:45:00Z'),
        tasksPlannedNext: 'Integrate mobile push notification service.',
        tasksCompleted: [
          {
            taskName: 'React Native Navigation & Auth Screen',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 22,
            deliverable: 'iOS Simulator build v0.1',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Achieved 60fps smooth transitions on mobile app prototype.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 26 },
          { taskType: 'Testing', hours: 5 },
          { taskType: 'Meetings', hours: 4 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Approved.',
          createdAt: new Date('2026-08-15T11:30:00Z'),
        },
      },
    ],
  });

  // --- SEED REPORTS FOR WEEK 2 (Aug 17, 2026) ---
  // Demonstrating CORRECTION WORKFLOW & VERSION HISTORY (Alex Mercer: V1 -> Needs Correction -> V2 -> Approved)
  await createFullReport({
    userId: member1.id,
    projectId: projectA.id,
    weekStart: week2,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-21T17:00:00Z'),
        tasksPlannedNext: 'Refactor role-based guard middleware.',
        optionalNotes: 'V1 submission lacking deliverable PR links.',
        tasksCompleted: [
          {
            taskName: 'OAuth2 Integration',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 80,
            status: 'In Progress',
            timePlanned: 20,
            timeSpent: 18,
            deliverable: 'Draft implementation',
          },
        ],
        blockers: [
          {
            description: 'Third party OAuth provider rate limiting during testing.',
            isKeyIssue: true,
          },
        ],
        achievements: [
          {
            description: 'Configured local OAuth mock service for dev testing.',
            isKeyHighlight: false,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 28 },
          { taskType: 'Testing', hours: 6 },
        ],
        reviewComment: {
          action: 'REQUESTED_CHANGES',
          comment: 'Please provide exact PR link deliverables and update task status details before approval.',
          createdAt: new Date('2026-08-22T09:00:00Z'),
        },
      },
      {
        versionNumber: 2,
        submittedAt: new Date('2026-08-22T14:30:00Z'),
        tasksPlannedNext: 'Refactor role-based guard middleware and unit test suite.',
        optionalNotes: 'Added GitHub PR link and resolved all requested review items.',
        tasksCompleted: [
          {
            taskName: 'OAuth2 Integration & Google Auth Provider',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 22,
            deliverable: 'https://github.com/teampulse/backend/pull/18',
          },
          {
            taskName: 'RBAC Guard Integration Tests',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 8,
            timeSpent: 8,
            deliverable: 'https://github.com/teampulse/backend/pull/19',
          },
        ],
        blockers: [
          {
            description: 'Third party OAuth provider rate limiting resolved with custom mock adapter.',
            isKeyIssue: true,
          },
        ],
        achievements: [
          {
            description: 'Successfully passed 100% automated RBAC security test suite.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 28 },
          { taskType: 'Testing', hours: 10 },
          { taskType: 'Documentation', hours: 2 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Thank you for updating the deliverables and adding test coverage. Approved!',
          createdAt: new Date('2026-08-22T16:00:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member2.id,
    projectId: projectA.id,
    weekStart: week2,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-21T16:45:00Z'),
        tasksPlannedNext: 'Build Report Version History side-by-side comparative UI.',
        tasksCompleted: [
          {
            taskName: 'Weekly Report Creation Form',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 18,
            deliverable: 'https://github.com/teampulse/frontend/pull/8',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Implemented multi-step form validation with zero lag.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 25 },
          { taskType: 'Testing', hours: 7 },
          { taskType: 'Meetings', hours: 3 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Report creation form functions seamlessly.',
          createdAt: new Date('2026-08-22T10:15:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member3.id,
    projectId: projectB.id,
    weekStart: week2,
    status: 'NEEDS_CORRECTION',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-21T18:15:00Z'),
        tasksPlannedNext: 'Automate weekly database backup cron job.',
        tasksCompleted: [
          {
            taskName: 'PostgreSQL Index Optimization',
            priority: 'Medium',
            plannedPercent: 100,
            actualPercent: 60,
            status: 'In Progress',
            timePlanned: 12,
            timeSpent: 15,
            deliverable: 'Draft SQL scripts',
          },
        ],
        blockers: [
          {
            description: 'Missing database index metrics breakdown in blockers section.',
            isKeyIssue: true,
          },
        ],
        achievements: [],
        hoursWorked: [
          { taskType: 'Development', hours: 20 },
          { taskType: 'Testing', hours: 4 },
        ],
        reviewComment: {
          action: 'REQUESTED_CHANGES',
          comment: 'Database index metrics and exact query latency impacts are missing from the report. Please elaborate on blockers and resubmit.',
          createdAt: new Date('2026-08-22T11:00:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member4.id,
    projectId: projectD.id,
    weekStart: week2,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-21T17:30:00Z'),
        tasksPlannedNext: 'Launch Google Analytics 4 tracking dashboard.',
        tasksCompleted: [
          {
            taskName: 'SEO Metadata & Sitemap Generation',
            priority: 'Medium',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 15,
            timeSpent: 12,
            deliverable: 'Dynamic sitemap.xml route',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Boosted lighthouse SEO score from 82 to 98.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 20 },
          { taskType: 'Testing', hours: 5 },
          { taskType: 'Documentation', hours: 5 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Lighthouse SEO score boost is incredible!',
          createdAt: new Date('2026-08-22T11:45:00Z'),
        },
      },
    ],
  });

  // --- SEED REPORTS FOR WEEK 3 (Aug 24, 2026) ---
  await createFullReport({
    userId: member1.id,
    projectId: projectA.id,
    weekStart: week3,
    status: 'APPROVED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-28T17:00:00Z'),
        tasksPlannedNext: 'OpenRouter AI Chatbot integration.',
        tasksCompleted: [
          {
            taskName: 'Executive Team Dashboard Charts',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 24,
            timeSpent: 22,
            deliverable: 'Recharts analytics dashboard component',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Delivered interactive workload distribution chart for manager view.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 28 },
          { taskType: 'Testing', hours: 6 },
          { taskType: 'Meetings', hours: 4 },
        ],
        reviewComment: {
          action: 'APPROVED',
          comment: 'Dashboard charts look super clean.',
          createdAt: new Date('2026-08-29T09:30:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member2.id,
    projectId: projectA.id,
    weekStart: week3,
    status: 'NEEDS_CORRECTION',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-28T16:30:00Z'),
        tasksPlannedNext: 'Add end-to-end Playwright tests for review workflow.',
        tasksCompleted: [
          {
            taskName: 'Report Version History Modal UI',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 80,
            status: 'In Progress',
            timePlanned: 18,
            timeSpent: 16,
            deliverable: 'Version history timeline drawer',
          },
        ],
        blockers: [
          {
            description: 'Testing hours breakdown in hours worked module is unallocated.',
            isKeyIssue: true,
          },
        ],
        achievements: [],
        hoursWorked: [
          { taskType: 'Development', hours: 24 },
          { taskType: 'Testing', hours: 0 },
        ],
        reviewComment: {
          action: 'REQUESTED_CHANGES',
          comment: 'Testing hours breakdown seems incomplete. Please allocate testing hours and resubmit.',
          createdAt: new Date('2026-08-29T10:00:00Z'),
        },
      },
    ],
  });

  await createFullReport({
    userId: member3.id,
    projectId: projectB.id,
    weekStart: week3,
    status: 'SUBMITTED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-28T18:00:00Z'),
        tasksPlannedNext: 'Configure automated DB health alerts on Discord.',
        tasksCompleted: [
          {
            taskName: 'PostgreSQL Indexing & Partitioning',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 21,
            deliverable: 'https://github.com/teampulse/backend/pull/25',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Resolved database indexing latency issues completely.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 25 },
          { taskType: 'Testing', hours: 8 },
          { taskType: 'Meetings', hours: 3 },
        ],
      },
    ],
  });

  await createFullReport({
    userId: member4.id,
    projectId: projectC.id,
    weekStart: week3,
    status: 'SUBMITTED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-08-28T17:30:00Z'),
        tasksPlannedNext: 'Deploy app to Apple TestFlight.',
        tasksCompleted: [
          {
            taskName: 'Mobile Push Notifications Integration',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 22,
            timeSpent: 20,
            deliverable: 'Expo Push Service client',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Integrated instant push notifications for report review status updates.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 26 },
          { taskType: 'Testing', hours: 6 },
          { taskType: 'Meetings', hours: 4 },
        ],
      },
    ],
  });

  // --- SEED REPORTS FOR WEEK 4 (Sep 1, 2026 - Current Week) ---
  await createFullReport({
    userId: member1.id,
    projectId: projectA.id,
    weekStart: week4,
    status: 'SUBMITTED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-09-05T17:00:00Z'),
        tasksPlannedNext: 'Prepare technical presentation slides & demo video.',
        optionalNotes: 'OpenRouter Laguna-S 2.1 AI assistant model is fully connected.',
        tasksCompleted: [
          {
            taskName: 'OpenRouter AI Assistant & Rich Text Markdown UI',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 18,
            deliverable: 'https://github.com/teampulse/frontend/pull/14',
          },
          {
            taskName: 'Account Profile Full Name Sync & Notifications API',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 10,
            timeSpent: 9,
            deliverable: 'https://github.com/teampulse/backend/pull/15',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Integrated rich text markdown AI assistant and real report notifications in header.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 26 },
          { taskType: 'Testing', hours: 8 },
          { taskType: 'Documentation', hours: 4 },
        ],
      },
    ],
  });

  await createFullReport({
    userId: member2.id,
    projectId: projectA.id,
    weekStart: week4,
    status: 'SUBMITTED',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-09-05T16:30:00Z'),
        tasksPlannedNext: 'Final regression testing and release readiness audit.',
        tasksCompleted: [
          {
            taskName: 'Team Member Profile Page & History Drawer',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Done',
            timePlanned: 20,
            timeSpent: 21,
            deliverable: 'https://github.com/teampulse/frontend/pull/16',
          },
        ],
        blockers: [],
        achievements: [
          {
            description: 'Completed dedicated team member profile view for managers.',
            isKeyHighlight: true,
          },
        ],
        hoursWorked: [
          { taskType: 'Development', hours: 25 },
          { taskType: 'Testing', hours: 7 },
          { taskType: 'Meetings', hours: 3 },
        ],
      },
    ],
  });

  await createFullReport({
    userId: member3.id,
    projectId: projectB.id,
    weekStart: week4,
    status: 'DRAFT',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-09-06T10:00:00Z'),
        tasksPlannedNext: 'Complete draft report submission for manager review.',
        tasksCompleted: [
          {
            taskName: 'Neon PostgreSQL Production Backup Verification',
            priority: 'Medium',
            plannedPercent: 100,
            actualPercent: 75,
            status: 'In Progress',
            timePlanned: 15,
            timeSpent: 12,
            deliverable: 'Automated backup script',
          },
        ],
        blockers: [
          {
            description: 'Awaiting final security compliance audit clearance.',
            isKeyIssue: true,
          },
        ],
        achievements: [],
        hoursWorked: [
          { taskType: 'Development', hours: 18 },
          { taskType: 'Testing', hours: 4 },
        ],
      },
    ],
  });

  await createFullReport({
    userId: member4.id,
    projectId: projectC.id,
    weekStart: week4,
    status: 'DRAFT',
    versionsData: [
      {
        versionNumber: 1,
        submittedAt: new Date('2026-09-06T11:00:00Z'),
        tasksPlannedNext: 'Submit weekly report for review.',
        tasksCompleted: [
          {
            taskName: 'App Store Metadata & Privacy Policy Documentation',
            priority: 'Low',
            plannedPercent: 100,
            actualPercent: 50,
            status: 'In Progress',
            timePlanned: 10,
            timeSpent: 5,
            deliverable: 'Draft Privacy Policy',
          },
        ],
        blockers: [],
        achievements: [],
        hoursWorked: [{ taskType: 'Documentation', hours: 10 }],
      },
    ],
  });

  console.log('✅ Successfully seeded 16 weekly reports across 4 weeks with complete workflow statuses (APPROVED, NEEDS_CORRECTION, SUBMITTED, DRAFT) and version history!');
  console.log('\n🔑 CREATED LOGIN CREDENTIALS:');
  console.log('---------------------------------------------------------');
  console.log('👑 Manager / Admin Account:');
  console.log('   Email:    manager@teampulse.com');
  console.log('   Password: Password123!');
  console.log('\n🧑‍💻 Team Member Accounts:');
  console.log('   Email:    alex@teampulse.com   | Password: Password123!');
  console.log('   Email:    elena@teampulse.com  | Password: Password123!');
  console.log('   Email:    david@teampulse.com  | Password: Password123!');
  console.log('   Email:    maya@teampulse.com   | Password: Password123!');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
