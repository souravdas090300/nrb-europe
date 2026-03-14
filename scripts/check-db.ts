import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  const tokenCount = await prisma.verificationToken.count()
  console.log(`DB_OK users=${userCount} verificationTokens=${tokenCount}`)
}

main()
  .catch((error: any) => {
    console.error('DB_ERR', error?.code ?? '', error?.message ?? error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
