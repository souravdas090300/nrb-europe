const { spawnSync } = require('node:child_process');

function getCommand(command) {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function run(command, args) {
  const result = spawnSync(getCommand(command), args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required for the Vercel build.');
  process.exit(1);
}

if (!process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;
  console.warn(
    'DIRECT_DATABASE_URL is not set. Falling back to DATABASE_URL for prisma migrate deploy. Configure a direct non-pooled connection string in Vercel to avoid migration issues with pooled URLs.'
  );
}

run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);
run('npm', ['run', 'build']);