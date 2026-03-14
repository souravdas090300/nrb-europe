import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'souravdas090300@gmail.com'
  const legacyAdminEmail = 'admin@nrbeurope.com'
  const password = 'admin123' // Change this in production!

  const existingUser = await prisma.user.findUnique({ where: { email } })

  // Migrate legacy seeded admin email if needed.
  if (!existingUser && email !== legacyAdminEmail) {
    const legacyUser = await prisma.user.findUnique({ where: { email: legacyAdminEmail } })
    if (legacyUser) {
      const migrated = await prisma.user.update({
        where: { email: legacyAdminEmail },
        data: { email, role: 'admin', emailVerified: legacyUser.emailVerified ?? new Date() },
      })

      console.log('Legacy admin migrated to:', migrated.email)
      return
    }
  }

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'admin', emailVerified: existingUser.emailVerified ?? new Date() },
    })

    console.log('Admin user already exists and is ready:', updated.email)
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
