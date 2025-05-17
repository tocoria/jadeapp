import { NextResponse } from 'next/server'
import { CustomerCategory, ProcedureCategory } from '@/components/CategorySelector'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // Get categories from URL parameters
  const { searchParams } = new URL(request.url)
  const customerCategory = searchParams.get('customerCategory') as CustomerCategory
  const commissionCategory = searchParams.get('commissionCategory') as ProcedureCategory

  // Return empty array for K30 customers and K20+C3 combinations
  if (customerCategory === 'K30' || (customerCategory === 'K20' && commissionCategory === 'C3')) {
    return NextResponse.json([])
  }

  // Start with a base query
  let query = supabase.from('promotion').select('*')

  // Apply filters based on customer category
  if (customerCategory === 'K10') {
    query = query.eq('available_k10', true)
  } else if (customerCategory === 'K20') {
    query = query.eq('available_k20', true)
  }

  // Execute the query
  const { data: promotions, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }

  return NextResponse.json(promotions)
} 