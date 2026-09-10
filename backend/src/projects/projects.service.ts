import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      include: { members: true, managers: true },
    });
  }

  async create(name: string, description?: string) {
    return this.prisma.project.create({ data: { name, description } });
  }

  async update(id: string, name: string, description?: string) {
    return this.prisma.project.update({
      where: { id: id },
      data: { name, description },
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
