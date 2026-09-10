import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    const adapter = new PrismaNeon({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}

