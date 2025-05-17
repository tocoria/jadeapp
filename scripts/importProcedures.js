const { PrismaClient } = require('@prisma/client')
const { parse } = require('csv-parse')
const fs = require('fs')
const path = require('path')

console.log('Script started...')

const prisma = new PrismaClient()

function generateCode(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Procedure name is required to generate code')
  }
  // Remove spaces and special characters, convert to uppercase
  return 'PRO' + name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)
}

async function importProcedures(csvFilePath) {
  console.log('Starting import from:', csvFilePath)
  
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`CSV file not found: ${csvFilePath}`)
  }

  const records = []
  
  console.log('Creating CSV parser...')
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    )

  console.log('Reading CSV records...')
  for await (const record of parser) {
    try {
      console.log('\nRaw record:', record)
      
      const procedureName = record['Procedure']
      if (!procedureName) {
        console.warn('Skipping record with missing procedure name:', record)
        continue
      }

      const processedRecord = {
        code: generateCode(procedureName),
        name: procedureName,
        priceK10: parseFloat((record['K10 Price (₩)'] || '0').replace(/,/g, '')),
        priceK20: parseFloat((record['K20 Price (₩)'] || '0').replace(/,/g, '')),
        priceK30: parseFloat((record['K30 Price (₩)'] || '0').replace(/,/g, '')),
      }

      console.log('Processed record:', processedRecord)
      records.push(processedRecord)
    } catch (error) {
      console.error('Error processing record:', record, '\nError:', error)
      continue
    }
  }

  console.log(`\nImporting ${records.length} procedures...`)

  for (const record of records) {
    try {
      console.log('\nUpserting:', record.name)
      await prisma.procedure.upsert({
        where: { code: record.code },
        update: record,
        create: record,
      })
      console.log(`Successfully imported: ${record.name} (${record.code})`)
    } catch (error) {
      console.error(`Failed to import ${record.name}:`, error)
    }
  }

  console.log('\nImport completed successfully!')
}

// Check if file path is provided
const csvFilePath = process.argv[2]
if (!csvFilePath) {
  console.error('Please provide the path to your CSV file')
  process.exit(1)
}

// Test database connection
console.log('Testing database connection...')
prisma.$connect()
  .then(() => {
    console.log('Database connection successful!')
    return importProcedures(csvFilePath)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Disconnecting from database...')
    await prisma.$disconnect()
  }) 