import { NextResponse } from 'next/server'
import { updateCustomerQuery } from '@/lib/customer-query'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const updated = await updateCustomerQuery(id, {
      status: body.status,
      adminNotes: body.adminNotes,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Customer query update error:', error)
    return NextResponse.json({ error: 'Failed to update query' }, { status: 500 })
  }
}
