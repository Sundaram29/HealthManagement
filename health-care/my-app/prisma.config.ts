import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    adapter: () => new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
