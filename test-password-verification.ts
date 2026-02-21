import { prisma } from './lib/prisma'
import bcrypt from 'bcrypt'

async function testPasswordVerification() {
  try {
    const testEmail = process.argv[2]
    const testPassword = process.argv[3]
    
    if (!testEmail || !testPassword) {
      console.log('Usage: npx tsx test-password-verification.ts <email> <password>')
      process.exit(1)
    }
    
    console.log(`Testing login for: ${testEmail}`)
    console.log('Password length:', testPassword.length)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('\nUser found:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Name:', user.name)
    console.log('  - Email Verified:', !!user.emailVerified)
    console.log('  - Has Password:', !!user.password)
    
    if (!user.password) {
      console.log('\n❌ User has no password (OAuth account)')
      return
    }
    
    if (!user.emailVerified) {
      console.log('\n⚠️  Email not verified')
    }
    
    // Test password
    console.log('\nTesting password comparison...')
    const startTime = Date.now()
    const isValid = await bcrypt.compare(testPassword, user.password)
    const duration = Date.now() - startTime
    
    console.log('  - Comparison took:', duration, 'ms')
    console.log('  - Password valid:', isValid ? '✅ YES' : '❌ NO')
    
    if (!isValid) {
      console.log('\n⚠️  Password mismatch detected')
      console.log('  - Stored hash length:', user.password.length)
      console.log('  - Input password length:', testPassword.length)
      console.log('  - Hash format:', user.password.substring(0, 7))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPasswordVerification()

