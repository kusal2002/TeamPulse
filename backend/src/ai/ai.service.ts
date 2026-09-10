import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openRouterApiKey: string | null = null;
  private openRouterModel = 'poolside/laguna-s-2.1:free';

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Optional() @Inject(ConfigService) private configService?: ConfigService,
  ) {
    this.openRouterApiKey =
      this.configService?.get<string>('OPENROUTER_API_KEY') ||
      process.env.OPENROUTER_API_KEY ||
      null;

    this.openRouterModel =
      this.configService?.get<string>('OPENROUTER_MODEL') ||
      process.env.OPENROUTER_MODEL ||
      'poolside/laguna-s-2.1:free';

    if (this.openRouterApiKey) {
      this.logger.log(`OpenRouter AI configured with model: ${this.openRouterModel}`);
    } else {
      this.logger.log('No OpenRouter API key found. Operating in structured report fallback mode.');
    }
  }

  private async buildTeamContext(): Promise<string> {
    const reports = await this.prisma.report.findMany({
      orderBy: { weekStart: 'desc' },
      take: 15,
      include: {
        user: { select: { name: true, email: true, role: true } },
        project: { select: { name: true } },
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
    });

    if (!reports || reports.length === 0) {
      return 'No reports filed yet in TeamPulse database.';
    }

    const contextLines = reports.map((r, i) => {
      const ver = r.versions[0];
      const memberName = r.user?.name || 'Unknown Member';
      const projectName = r.project?.name || 'General Project';
      const status = r.status;
      const week = r.weekStart.toISOString().split('T')[0];

      const tasksCompletedStr = ver?.tasksCompleted?.length
        ? ver.tasksCompleted
            .map(
              (t) =>
                `• ${t.taskName} (${t.status}, spent: ${t.timeSpent}h, priority: ${t.priority})`,
            )
            .join('\n    ')
        : '  None';

      const blockersStr = ver?.blockers?.length
        ? ver.blockers
            .map((b) => `• ${b.description}${b.isKeyIssue ? ' [KEY ISSUE]' : ''}`)
            .join('\n    ')
        : '  None';

      const achievementsStr = ver?.achievements?.length
        ? ver.achievements
            .map(
              (a) =>
                `• ${a.description}${a.isKeyHighlight ? ' [KEY HIGHLIGHT]' : ''}`,
            )
            .join('\n    ')
        : '  None';

      const plannedNext = ver?.tasksPlannedNext || 'None';

      return `[Report ${i + 1}]
Member: ${memberName}
Project: ${projectName}
Week Starting: ${week}
Status: ${status}
Completed Tasks:
    ${tasksCompletedStr}
Blockers & Issues:
    ${blockersStr}
Achievements:
    ${achievementsStr}
Planned Next Week: ${plannedNext}
---`;
    });

    return contextLines.join('\n\n');
  }

  async askAi(prompt: string): Promise<string> {
    const context = await this.buildTeamContext();

    // 1. Try OpenRouter API if OPENROUTER_API_KEY is configured
    if (this.openRouterApiKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'TeamPulse AI',
          },
          body: JSON.stringify({
            model: this.openRouterModel,
            messages: [
              {
                role: 'system',
                content: `You are TeamPulse AI, an intelligent executive team assistant for software managers. Use the following live team report context to answer the user's question accurately, concisely, and professionally in markdown format.

--- RECENT TEAM REPORTS DATA ---
${context}`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return text;
        } else {
          const errText = await response.text();
          this.logger.warn(`OpenRouter API request returned HTTP ${response.status}: ${errText}`);
        }
      } catch (err: any) {
        this.logger.error(`OpenRouter API call failed: ${err?.message}`);
      }
    }

    // 2. Fallback response if keys are absent or API calls fail
    return this.generateFallbackResponse(prompt, context);
  }

  private generateFallbackResponse(prompt: string, context: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('blocker') || lower.includes('issue') || lower.includes('risk')) {
      return `### 🚨 Team Blockers Summary\nBased on recent weekly reports, here are key flagged issues across the team:\n\n${context.includes('KEY ISSUE') ? context : 'No key blocker flags reported this week. All team projects are currently proceeding smoothly.'}`;
    }

    if (lower.includes('summary') || lower.includes('summarize') || lower.includes('activity')) {
      return `### 📊 Weekly Team Activity Summary\n\n${context.slice(0, 1500)}\n\n*Note: Configure \`OPENROUTER_API_KEY\` in your \`.env\` file to activate OpenRouter model \`${this.openRouterModel}\`.*`;
    }

    return `### 🤖 TeamPulse Assistant\nHere is recent report context related to your query:\n\n${context.slice(0, 1200)}\n\n*Tip: Set \`OPENROUTER_API_KEY\` in \`.env\` to enable LLM model reasoning with \`${this.openRouterModel}\`.*`;
  }
}
