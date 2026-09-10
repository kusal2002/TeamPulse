import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { IsNotEmpty, IsString } from 'class-validator';
import { Roles } from '../common/decorators/roles.decorator.js';

class CreateProjectDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() description?: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(@Inject(ProjectsService) private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Post()
  @Roles('MANAGER')
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto.name, dto.description);
  }

  @Put(':id')
  @Roles('MANAGER')
  update(@Param('id') id: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.update(id, dto.name, dto.description);
  }

  @Delete(':id')
  @Roles('MANAGER')
  delete(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
