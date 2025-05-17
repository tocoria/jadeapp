import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function generateCode(name: string): string {
  // Remove spaces and special characters, convert to uppercase
  return 'PRO' + name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)
}

async function importProcedures(csvFilePath: string) {
  const records: any[] = []
  
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      })
    )

  for await (const record of parser) {
    // Using the actual column names from your CSV
    records.push({
      code: generateCode(record['Procedure']),
      name: record['Procedure'],
      priceK10: parseFloat(record['K10 Price (₩)'].replace(/,/g, '')),
      priceK20: parseFloat(record['K20 Price (₩)'].replace(/,/g, '')),
      priceK30: parseFloat(record['K30 Price (₩)'].replace(/,/g, '')),
    })
  }

  console.log(`Importing ${records.length} procedures...`)

  for (const record of records) {
    await prisma.procedure.upsert({
      where: { code: record.code },
      update: record,
      create: record,
    })
    console.log(`Imported: ${record.name} (${record.code})`)
  }

  console.log('Import completed successfully!')
}

// Check if file path is provided
const csvFilePath = process.argv[2]
if (!csvFilePath) {
  console.error('Please provide the path to your CSV file')
  process.exit(1)
}

// Run the import
importProcedures(csvFilePath)
  .catch((e) => {
    console.error('Error during import:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 