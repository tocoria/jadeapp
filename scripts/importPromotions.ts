import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

function generateCode(name: string): string {
  // Remove spaces and special characters, convert to uppercase
  return 'PRO' + name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)
}

interface CSVPromotion {
  name: string
  package: string
  'price (₩)': string
  available_k10: string
  available_k20: string
}

interface Promotion {
  id: string
  code: string
  name: string
  description: string
  price: number
  available_k10: boolean
  available_k20: boolean
  applicableCategories: string[]
  restrictedCommissionCategories: string[]
}

async function importPromotions(csvFilePath: string) {
  console.log('Starting import from:', csvFilePath)
  
  const records: Promotion[] = []
  
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    )

  for await (const record of parser) {
    const csvRecord = record as CSVPromotion
    
    // Convert string 'true'/'false' to boolean
    const isK10Available = csvRecord.available_k10.toLowerCase() === 'true'
    const isK20Available = csvRecord.available_k20.toLowerCase() === 'true'
    
    // Determine applicable categories
    const applicableCategories: string[] = []
    if (isK10Available) {
      applicableCategories.push('K10')
      // K30 customers can access K10 promotions
      applicableCategories.push('K30')
    }
    if (isK20Available) {
      applicableCategories.push('K20')
    }

    const promotion: Promotion = {
      id: crypto.randomUUID(),
      code: generateCode(csvRecord.name),
      name: csvRecord.name,
      description: csvRecord.package,
      price: parseInt(csvRecord['price (₩)'].replace(/,/g, '')),
      available_k10: isK10Available,
      available_k20: isK20Available,
      applicableCategories,
      restrictedCommissionCategories: []
    }

    records.push(promotion)
  }

  console.log(`Processed ${records.length} promotions. Starting import...`)

  for (const promotion of records) {
    try {
      const { error } = await supabase
        .from('promotion')
        .upsert(promotion)

      if (error) {
        console.error(`Failed to import promotion ${promotion.name}:`, error)
      } else {
        console.log(`Successfully imported: ${promotion.name} (${promotion.code})`)
      }
    } catch (error) {
      console.error(`Error importing ${promotion.name}:`, error)
    }
  }

  console.log('Import completed!')
}

// Run the import
const csvPath = path.join(process.cwd(), 'promotions_data.csv')
importPromotions(csvPath)
  .catch(console.error) 