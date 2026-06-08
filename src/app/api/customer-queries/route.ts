import { NextResponse } from 'next/server'
import { listCustomerQueries } from '@/lib/customer-query'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const source = searchParams.get('source') || undefined
    const queries = await listCustomerQueries(status, source)
    return NextResponse.json(queries)
  } catch (error) {
    console.error('Customer queries list error:', error)
    return NextResponse.json({ error: 'Failed to load queries' }, { status: 500 })
  }
}
