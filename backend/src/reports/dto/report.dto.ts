import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class TaskDto {
  @IsString() taskName: string;
  @IsString() priority: string;
  @IsNumber() plannedPercent: number;
  @IsNumber() actualPercent: number;
  @IsString() status: string;
  @IsNumber() timePlanned: number;
  @IsNumber() timeSpent: number;
  @IsOptional() @IsString() deliverable?: string;
}

class BlockerDto {
  @IsString() description: string;
  @IsBoolean() isKeyIssue: boolean;
}

class AchievementDto {
  @IsString() description: string;
  @IsBoolean() isKeyHighlight: boolean;
}

class HoursDto {
  @IsString() taskType: string;
  @IsNumber() hours: number;
}

export class CreateReportDto {
  @IsDateString() weekStart: string;
  @IsString() @IsNotEmpty() projectId: string;

  @IsString() tasksPlannedNext: string;
  @IsOptional() @IsString() optionalNotes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasksCompleted: TaskDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockerDto)
  blockers: BlockerDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementDto)
  achievements: AchievementDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoursDto)
  hoursWorked: HoursDto[];
}

export class ReviewDto {
  @IsString() @IsNotEmpty() action: 'APPROVED' | 'REQUESTED_CHANGES';
  @IsOptional() @IsString() comment?: string; // Required if action is REQUESTED_CHANGES
}
