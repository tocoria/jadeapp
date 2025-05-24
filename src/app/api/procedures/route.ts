import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    console.log('Attempting to connect to Supabase...')
    
    // Main query - select only existing fields
    const { data: procedures, error } = await supabase
      .from('procedure')
      .select('id, name, type, priceK0, priceK20, priceK25, priceK30, sort_order, createdAt, updatedAt')

    if (error) {
      console.error('Main query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({ 
        error: 'Failed to fetch procedures',
        details: error.message,
        hint: error.hint
      }, { status: 500 })
    }

    if (!procedures || procedures.length === 0) {
      console.log('No procedures found in the database')
      return NextResponse.json([])
    }

    // Sort procedures by sort_order if it exists, otherwise keep original order
    const sortedProcedures = procedures.sort((a, b) => {
      if (a.sort_order != null && b.sort_order != null) {
        return a.sort_order - b.sort_order
      }
      return 0
    })

    console.log('Successfully fetched procedures:', {
      count: sortedProcedures.length,
      sample: sortedProcedures[0],
      fields: sortedProcedures[0] ? Object.keys(sortedProcedures[0]) : []
    })

    return NextResponse.json(sortedProcedures)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 