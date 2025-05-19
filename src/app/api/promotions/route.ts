import { NextResponse } from 'next/server'
import { CustomerCategory, ProcedureCategory } from '@/components/CategorySelector'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('Initializing Supabase client for promotions...')
    const supabase = createClient()
    
    // Get categories from URL parameters
    const { searchParams } = new URL(request.url)
    const customerCategory = searchParams.get('customerCategory') as CustomerCategory
    const commissionCategory = searchParams.get('commissionCategory') as ProcedureCategory

    console.log('Request parameters:', { customerCategory, commissionCategory })

    // Return empty array for K30 customers and K20+C3 combinations
    if (customerCategory === 'K30' || (customerCategory === 'K20' && commissionCategory === '커3')) {
      console.log('Returning empty array for restricted combination:', { customerCategory, commissionCategory })
      return NextResponse.json([])
    }

    // Start with a base query
    let query = supabase.from('promotion').select('*')

    // Apply filters based on customer category
    if (customerCategory === 'K0') {
      query = query.eq('availableK0', true)
    } else if (customerCategory === 'K20') {
      query = query.eq('availableK20', true)
    } else if (customerCategory === 'K25') {
      query = query.eq('availableK25', true)
    }

    console.log('Executing Supabase query...')
    // Execute the query
    const { data: promotions, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch promotions', details: error.message }, { status: 500 })
    }

    console.log('Successfully fetched promotions:', {
      count: promotions?.length || 0,
      sample: promotions?.[0]
    })

    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Unexpected error in promotions route:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 