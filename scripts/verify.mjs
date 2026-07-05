#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const task = process.argv[2];

const taskCommands = {
  test: [
    ['corepack', ['pnpm', '--filter', '@wp-next-public/core', 'test']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/react', 'test']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/cli', 'test']],
  ],
  build: [
    ['corepack', ['pnpm', '--filter', '@wp-next-public/core', 'build']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/react', 'build']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/cli', 'build']],
    ['corepack', ['pnpm', '--dir', 'docs', 'docs:build']],
  ],
  lint: [
    ['corepack', ['pnpm', '--filter', '@wp-next-public/core', 'lint']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/core', 'build']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/react', 'lint']],
    ['corepack', ['pnpm', '--filter', '@wp-next-public/cli', 'lint']],
  ],
};

if (!task || !(task in taskCommands)) {
  console.error('Usage: node scripts/verify.mjs <test|build|lint>');
  process.exit(1);
}

for (const [command, args, extraEnv] of taskCommands[task]) {
  const label = [command, ...args].join(' ');
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...(extraEnv ?? {}) },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
