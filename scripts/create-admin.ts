import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@nrbeurope.com'
  const password = 'admin123' // Change this in production!

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('Admin user already exists:', existingUser.email)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  console.log('Admin user created:', user.email)
  console.log('Password: admin123 (change this!)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
