/* eslint-disable no-console */
const { execSync } = require('child_process')

function run(command) {
  console.log(`\n$ ${command}`)
  execSync(command, { stdio: 'inherit' })
}

function isLocalhostUrl(value) {
  return /localhost|127\.0\.0\.1/i.test(value)
}

function assertValidPostgresUrl(name, value) {
  if (!value) {
    throw new Error(`${name} is required in Vercel environment variables.`)
  }

  if (value.startsWith('file:')) {
    throw new Error(`${name} must be a PostgreSQL URL, not a SQLite file URL.`)
  }

  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    throw new Error(`${name} must start with postgresql:// or postgres://`)
  }

  if (isLocalhostUrl(value)) {
    throw new Error(`${name} cannot point to localhost in Vercel production.`)
  }
}

function main() {
  const databaseUrl = process.env.DATABASE_URL
  const directDatabaseUrl = process.env.DIRECT_DATABASE_URL || databaseUrl

  assertValidPostgresUrl('DATABASE_URL', databaseUrl)
  assertValidPostgresUrl('DIRECT_DATABASE_URL', directDatabaseUrl)

  // Some providers expose only pooled URL; fallback keeps Prisma migrations working.
  process.env.DIRECT_DATABASE_URL = directDatabaseUrl

  run('npx prisma generate')
  run('npx prisma migrate deploy')
  run('npm run build')
}

main()
