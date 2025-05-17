import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initDb() {
  try {
    // Push the schema to Supabase
    console.log('Initializing database...')
    
    // Test the connection
    await prisma.$connect()
    console.log('Successfully connected to Supabase!')

    // You can add any initial setup here
    console.log('Database initialization completed!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initDb() 