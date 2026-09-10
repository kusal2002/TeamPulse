import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateReportDto, ReviewDto } from './dto/report.dto.js';

@Controller('reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private reportsService: ReportsService) {}

  // --- TEAM MEMBER ENDPOINTS ---

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    return this.reportsService.createDraft(user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.updateReport(id, user.id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.submitReport(id, user.id);
  }

  @Get('notifications')
  getNotifications(@CurrentUser() user: any) {
    return this.reportsService.getNotifications(user.id, user.role);
  }

  @Get('my-history')
  getMyHistory(@CurrentUser() user: any) {
    return this.reportsService.getMyHistory(user.id);
  }

  @Get(':id')
  getDetail(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.getReportDetail(id, user.id);
  }

  // --- MANAGER ENDPOINTS ---

  @Get()
  @Roles('MANAGER')
  getAllReports(
    @Query('weekStart') weekStart?: string,
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.getAllReports({
      weekStart,
      userId,
      projectId,
      status,
    });
  }

  @Get('manager/:id')
  @Roles('MANAGER')
  getManagerDetail(@Param('id') id: string, @CurrentUser() user: any) {
    // Pass isManager = true to bypass ownership check
    return this.reportsService.getReportDetail(id, user.id, true);
  }

  @Post(':id/review')
  @Roles('MANAGER')
  review(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewDto,
  ) {
    return this.reportsService.reviewReport(
      id,
      user.id,
      dto.action,
      dto.comment,
    );
  }
}
