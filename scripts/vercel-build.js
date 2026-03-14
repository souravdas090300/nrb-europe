const { spawnSync } = require('node:child_process');

function getCommand(command) {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function run(command, args) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(getCommand(command), args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function isLocalhostUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function assertValidPostgresUrl(name, value) {
  if (!value) {
    console.error(`${name} is required for the Vercel build.`);
    process.exit(1);
  }

  const lower = value.toLowerCase();

  if (lower.startsWith('file:')) {
    console.error(
      `${name} is set to a local file URL (${value}). Vercel production requires a remote Postgres URL such as postgresql://user:pass@host:5432/db?sslmode=require.`
    );
    process.exit(1);
  }

  if (!lower.startsWith('postgres://') && !lower.startsWith('postgresql://')) {
    console.error(
      `${name} must be a Postgres connection string (postgresql://... or postgres://...). Current value starts with: ${value.split(':')[0] || 'unknown'}:`
    );
    process.exit(1);
  }

  if (isLocalhostUrl(value)) {
    console.error(
      `${name} points to localhost. Vercel cannot access localhost:5432 from the build machine. Use your hosted database connection string.`
    );
    process.exit(1);
  }
}

assertValidPostgresUrl('DATABASE_URL', process.env.DATABASE_URL);

if (
  !process.env.DIRECT_DATABASE_URL &&
  process.env.DATABASE_URL.toLowerCase().startsWith('prisma://')
) {
  console.error(
    'DIRECT_DATABASE_URL is required when DATABASE_URL uses prisma://. Set DIRECT_DATABASE_URL to a direct postgresql:// connection for prisma migrate deploy.'
  );
  process.exit(1);
}

if (!process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;
  console.warn(
    'DIRECT_DATABASE_URL is not set. Falling back to DATABASE_URL for prisma migrate deploy. Configure a direct non-pooled connection string in Vercel to avoid migration issues with pooled URLs.'
  );
}

assertValidPostgresUrl('DIRECT_DATABASE_URL', process.env.DIRECT_DATABASE_URL);

run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);
run('npm', ['run', 'build']);