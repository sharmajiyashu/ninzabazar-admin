import prisma from '@/lib/prisma'

export const CUSTOMER_QUERY_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const

export type CustomerQueryStatus = (typeof CUSTOMER_QUERY_STATUSES)[number]

export type CustomerQueryRecord = {
  id: string
  firstName: string
  phoneNumber: string
  queryText: string
  status: string
  adminNotes: string | null
  source: string
  productId: string | null
  productName: string | null
  sellerId: string | null
  quantity: number | null
  color: string | null
  createdAt: Date
  updatedAt: Date
}

type CustomerQueryDelegate = {
  findMany: (args: {
    where?: { status?: string; source?: string }
    orderBy?: { createdAt: 'desc' }
  }) => Promise<CustomerQueryRecord[]>
  update: (args: {
    where: { id: string }
    data: { status?: string; adminNotes?: string | null }
  }) => Promise<CustomerQueryRecord>
}

const db = prisma as typeof prisma & { customerQuery?: CustomerQueryDelegate }

function hasCustomerQueryModel() {
  return typeof db.customerQuery?.findMany === 'function'
}

export async function listCustomerQueries(
  status?: string,
  source?: string
): Promise<CustomerQueryRecord[]> {
  const normalizedStatus = status?.toUpperCase()
  const normalizedSource = source?.toUpperCase()

  if (hasCustomerQueryModel()) {
    return db.customerQuery!.findMany({
      where: {
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
        ...(normalizedSource ? { source: normalizedSource } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (normalizedStatus && normalizedSource) {
    return prisma.$queryRaw<CustomerQueryRecord[]>`
      SELECT id, "firstName", "phoneNumber", "query" as "queryText", status, "adminNotes",
        source, "productId", "productName", "sellerId", quantity, color, "createdAt", "updatedAt"
      FROM "CustomerQuery"
      WHERE status = ${normalizedStatus} AND source = ${normalizedSource}
      ORDER BY "createdAt" DESC
    `
  }
  if (normalizedStatus) {
    return prisma.$queryRaw<CustomerQueryRecord[]>`
      SELECT id, "firstName", "phoneNumber", "query" as "queryText", status, "adminNotes",
        source, "productId", "productName", "sellerId", quantity, color, "createdAt", "updatedAt"
      FROM "CustomerQuery"
      WHERE status = ${normalizedStatus}
      ORDER BY "createdAt" DESC
    `
  }
  if (normalizedSource) {
    return prisma.$queryRaw<CustomerQueryRecord[]>`
      SELECT id, "firstName", "phoneNumber", "query" as "queryText", status, "adminNotes",
        source, "productId", "productName", "sellerId", quantity, color, "createdAt", "updatedAt"
      FROM "CustomerQuery"
      WHERE source = ${normalizedSource}
      ORDER BY "createdAt" DESC
    `
  }
  return prisma.$queryRaw<CustomerQueryRecord[]>`
    SELECT id, "firstName", "phoneNumber", "query" as "queryText", status, "adminNotes",
      source, "productId", "productName", "sellerId", quantity, color, "createdAt", "updatedAt"
    FROM "CustomerQuery"
    ORDER BY "createdAt" DESC
  `
}

export async function updateCustomerQuery(
  id: string,
  data: { status?: CustomerQueryStatus; adminNotes?: string | null }
) {
  const status = data.status?.toUpperCase()
  if (status && !CUSTOMER_QUERY_STATUSES.includes(status as CustomerQueryStatus)) {
    throw new Error('Invalid status')
  }

  if (hasCustomerQueryModel()) {
    return db.customerQuery!.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
      },
    })
  }

  if (status) {
    await prisma.$executeRaw`
      UPDATE "CustomerQuery" SET status = ${status}, "updatedAt" = NOW() WHERE id = ${id}
    `
  }
  if (data.adminNotes !== undefined) {
    await prisma.$executeRaw`
      UPDATE "CustomerQuery" SET "adminNotes" = ${data.adminNotes}, "updatedAt" = NOW() WHERE id = ${id}
    `
  }
  const rows = await prisma.$queryRaw<CustomerQueryRecord[]>`
    SELECT id, "firstName", "phoneNumber", "query" as "queryText", status, "adminNotes",
      source, "productId", "productName", "sellerId", quantity, color, "createdAt", "updatedAt"
    FROM "CustomerQuery" WHERE id = ${id} LIMIT 1
  `
  return rows[0] ?? null
}
