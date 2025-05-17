import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function GET() {
  try {
    console.log('Attempting to connect to Supabase...')
    
    // Debug query to check RLS and data
    const { data: debugData, error: debugError } = await supabase
      .from('procedure')
      .select()

    console.log('Full debug query result:', {
      hasData: debugData && debugData.length > 0,
      dataCount: debugData?.length || 0,
      firstRow: debugData?.[0],
      error: debugError
    })

    if (debugError) {
      console.error('Debug query error:', {
        message: debugError.message,
        code: debugError.code,
        details: debugError.details
      })
      return NextResponse.json({ 
        error: 'Debug query failed',
        details: debugError.message 
      }, { status: 500 })
    }

    // Main query
    const { data: procedures, error } = await supabase
      .from('procedure')
      .select('id, code, name, priceK10, priceK20, priceK30, createdAt, updatedAt')

    if (error) {
      console.error('Main query error:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      return NextResponse.json({ 
        error: 'Failed to fetch procedures',
        details: error.message 
      }, { status: 500 })
    }

    if (!procedures || procedures.length === 0) {
      console.log('No procedures found in the database')
      return NextResponse.json([])
    }

    console.log('Successfully fetched procedures:', {
      count: procedures.length,
      sample: procedures[0]
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 