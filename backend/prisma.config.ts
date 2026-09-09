import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx ./prisma/seed.ts',
  },

  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgresql:1234@localhost:5432/neondb',
  },
});
