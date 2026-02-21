import { PrismaClient } from '@prisma/client'

async function testDatabaseConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Testing database connection...\n')
    
    // Test 1: Basic connection with raw query
    console.log('Test 1: Checking database version...')
    const result = await prisma.$queryRaw<Array<{version: string}>>`SELECT version()`
    console.log('✅ Database connection successful!')
    console.log('   PostgreSQL version:', result[0]?.version?.split(' ')[1] || 'Unknown')
    
    // Test 2: Check if tables exist
    console.log('\nTest 2: Checking database tables...')
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('✅ Found', tables.length, 'tables:')
    tables.forEach((table) => console.log('   -', table.table_name))
    
    // Test 3: Count users
    console.log('\nTest 3: Querying User table...')
    const userCount = await prisma.user.count()
    console.log('✅ User table accessible')
    console.log('   Total users:', userCount)
    
    // Test 4: Count projects
    console.log('\nTest 4: Querying Project table...')
    const projectCount = await prisma.project.count()
    console.log('✅ Project table accessible')
    console.log('   Total projects:', projectCount)
    
    console.log('\n✨ All database connection tests passed!')
    
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('Error:', error instanceof Error ? error.message : String(error))
    console.error('\nDetails:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database connection closed.')
  }
}

testDatabaseConnection()
