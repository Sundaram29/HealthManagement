import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({ adapter })
}

function createMissingDatabaseProxy() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error('DATABASE_URL is not configured')
      },
    }
  )
}

const prismaClient = globalForPrisma.prisma ?? createPrismaClient()

export const prisma = prismaClient ?? createMissingDatabaseProxy()

if (process.env.NODE_ENV !== 'production' && prismaClient) {
  globalForPrisma.prisma = prismaClient
}
