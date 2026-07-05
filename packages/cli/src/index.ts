#!/usr/bin/env node
// @wp-next/cli — WordPress to Next.js migration CLI

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { pullCommand } from './commands/pull.js';
import { syncCommand } from './commands/sync.js';

const program = new Command();

program
  .name('wp-next')
  .description('Modernize your WordPress site with Next.js — one command')
  .version('0.1.0');

// ── init ──
program
  .command('init')
  .description('Scan a WordPress site and generate a Next.js project')
  .requiredOption('--url <url>', 'WordPress site URL')
  .option('--mode <mode>', 'Data source mode: rest | graphql | hmac', 'rest')
  .option('--hmac-secret <secret>', 'HMAC secret for hmac mode')
  .option('--output <path>', 'Output directory', '.')
  .option(
    '--template <name>',
    'Project template: minimal | blog | full',
    'blog',
  )
  .option('--post-types <list>', 'Limit post types (comma-separated)')
  .option('--ssg', 'Generate SSG pages instead of SSR', false)
  .action(async (options) => {
    try {
      await initCommand({
        url: options.url,
        mode: options.mode,
        hmacSecret: options.hmacSecret,
        output: options.output,
        template: options.template,
        postTypes: options.postTypes,
        ssg: options.ssg,
      });
    } catch (err) {
      console.error('❌ Error:', (err as Error).message);
      process.exit(1);
    }
  });

// ── pull ──
program
  .command('pull')
  .description('Pull content from a WordPress site')
  .requiredOption('--url <url>', 'WordPress site URL')
  .option('--mode <mode>', 'Data source mode: rest | graphql | hmac', 'rest')
  .option('--hmac-secret <secret>', 'HMAC secret for hmac mode')
  .option('--output <path>', 'Content output directory', 'content')
  .option('--all', 'Pull all content (default: first 10 posts only)', false)
  .option('--type <types>', 'Post type to pull', 'posts')
  .option('--format <fmt>', 'Output format: mdx | json', 'mdx')
  .action(async (options) => {
    try {
      await pullCommand({
        url: options.url,
        mode: options.mode,
        hmacSecret: options.hmacSecret,
        output: options.output,
        all: options.all,
        type: options.type,
        format: options.format,
      });
    } catch (err) {
      console.error('❌ Error:', (err as Error).message);
      process.exit(1);
    }
  });

// ── sync ──
program
  .command('sync')
  .description('Incremental sync — only pull changed posts since last sync')
  .requiredOption('--url <url>', 'WordPress site URL')
  .option('--mode <mode>', 'Data source mode: rest | graphql | hmac', 'rest')
  .option('--hmac-secret <secret>', 'HMAC secret for hmac mode')
  .option('--output <path>', 'Content output directory', 'content')
  .option('--since <iso-date>', 'Sync from this date (ISO 8601), overrides stored state')
  .option('--type <type>', 'Post type to sync', 'posts')
  .option('--dry-run', 'Preview changes without writing', false)
  .option(
    '--revalidate-url <url>',
    'Next.js ISR revalidation endpoint (e.g. /api/revalidate)',
  )
  .option(
    '--revalidate-secret <secret>',
    'Secret sent as x-revalidate-secret when revalidating',
  )
  .action(async (options) => {
    try {
      await syncCommand({
        url: options.url,
        mode: options.mode,
        hmacSecret: options.hmacSecret,
        output: options.output,
        since: options.since,
        type: options.type,
        dryRun: options.dryRun,
        revalidateUrl: options.revalidateUrl,
        revalidateSecret: options.revalidateSecret,
      });
    } catch (err) {
      console.error('❌ Error:', (err as Error).message);
      process.exit(1);
    }
  });

// ── Parse ──
program.parse(process.argv);
