/* eslint-disable no-console */
const { execSync } = require('child_process')

function run(command) {
  console.log(`\n$ ${command}`)
  execSync(command, { stdio: 'inherit' })
}

function isLocalhostUrl(value) {
  return /localhost|127\.0\.0\.1/i.test(value)
}

function getFirstDefinedEnv(keys) {
  for (const key of keys) {
    const value = process.env[key]
    if (value) {
      return { key, value }
    }
  }

  return null
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
  const isProductionDeploy = process.env.VERCEL_ENV === 'production'

  const databaseMatch = getFirstDefinedEnv([
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING',
  ])

  const directDatabaseMatch = getFirstDefinedEnv([
    'DIRECT_DATABASE_URL',
    'POSTGRES_URL_NON_POOLING',
    'POSTGRES_URL',
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
  ])

  const databaseUrl = databaseMatch?.value
  const directDatabaseUrl = directDatabaseMatch?.value || databaseUrl

  if (!databaseUrl) {
    if (isProductionDeploy) {
      throw new Error(
        'DATABASE_URL is required for production deploys. Set DATABASE_URL (or POSTGRES_PRISMA_URL/POSTGRES_URL) in Vercel environment variables.'
      )
    }

    console.warn(
      'No database URL found for this non-production deploy. Skipping prisma migrate deploy.'
    )
    run('npx prisma generate')
    run('npm run build')
    return
  }

  assertValidPostgresUrl('DATABASE_URL', databaseUrl)
  assertValidPostgresUrl('DIRECT_DATABASE_URL', directDatabaseUrl)

  // Normalize aliases so Prisma always sees standard variable names.
  if (databaseMatch && databaseMatch.key !== 'DATABASE_URL') {
    process.env.DATABASE_URL = databaseUrl
    console.log(`Using ${databaseMatch.key} as DATABASE_URL`)
  }

  // Some providers expose only pooled URL; fallback keeps Prisma migrations working.
  process.env.DIRECT_DATABASE_URL = directDatabaseUrl

  if (directDatabaseMatch && directDatabaseMatch.key !== 'DIRECT_DATABASE_URL') {
    console.log(`Using ${directDatabaseMatch.key} as DIRECT_DATABASE_URL`)
  }

  run('npx prisma generate')

  if (isProductionDeploy) {
    run('npx prisma migrate deploy')
  } else {
    console.log('Skipping prisma migrate deploy for non-production deploy.')
  }

  run('npm run build')
}

main()
