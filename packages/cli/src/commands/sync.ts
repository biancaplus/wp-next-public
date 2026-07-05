// @wp-next/cli — wp-next sync 命令
// 增量同步：比较本地时间戳 → 只拉取变更的文章

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { WPPost, DataSourceMode } from '@wp-next/core';
import { createWpClient } from '@wp-next/core';
import { toFrontmatter } from '../lib/frontmatter.js';

export interface SyncOptions {
  url: string;
  mode?: DataSourceMode;
  hmacSecret?: string;
  output?: string;
  /** 从指定时间开始同步（ISO 8601），默认从上次同步时间 */
  since?: string;
  /** 仅预览变更，不写入 */
  dryRun?: boolean;
  /** Next.js ISR revalidation URL（如 https://mysite.com/api/revalidate） */
  revalidateUrl?: string;
  /** Next.js ISR revalidation secret */
  revalidateSecret?: string;
  /** 指定文章类型 */
  type?: string;
}

interface SyncState {
  lastSync: string; // ISO 8601
  postCount: number;
  url: string;
}

const STATE_DIR = '.wp-next';
const STATE_FILE = 'sync-state.json';

function sanitizePathSegment(value: string, fallback: string): string {
  const safe = value
    .trim()
    .replace(/[/\\]/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');

  return safe || fallback;
}

async function readState(outputDir: string): Promise<SyncState | null> {
  try {
    const content = await fs.readFile(
      path.join(outputDir, STATE_DIR, STATE_FILE),
      'utf-8',
    );
    return JSON.parse(content) as SyncState;
  } catch {
    return null;
  }
}

async function writeState(outputDir: string, state: SyncState): Promise<void> {
  const dir = path.join(outputDir, STATE_DIR);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, STATE_FILE),
    JSON.stringify(state, null, 2),
    'utf-8',
  );
}

async function revalidatePage(
  revalidateUrl: string,
  path: string,
  secret?: string,
): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (secret) {
      headers['x-revalidate-secret'] = secret;
    }

    const res = await fetch(revalidateUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ path }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`  ⚠️  Revalidation failed for ${path}: ${(err as Error).message}`);
    return false;
  }
}

/**
 * wp-next sync 命令主逻辑
 *
 * 1. 读取 .wp-next/sync-state.json 获取上次同步时间
 * 2. 通过 WP API 查询 modified_after 的变更文章
 * 3. 增量更新 content/ 目录
 * 4. 更新 sync-state.json
 * 5. （可选）触发 Next.js ISR revalidation
 */
export async function syncCommand(opts: SyncOptions): Promise<void> {
  const {
    url,
    mode = 'rest',
    hmacSecret,
    output = 'content',
    since,
    dryRun = false,
    revalidateUrl,
    revalidateSecret = process.env.REVALIDATE_SECRET,
    type = 'posts',
  } = opts;

  const projectDir = process.cwd();
  const contentDir = path.resolve(projectDir, output);

  console.log(`\n🔄 wp-next sync`);
  console.log(`   URL:    ${url}`);
  console.log(`   Mode:   ${mode}`);
  console.log(`   Output: ${contentDir}`);
  if (dryRun) console.log(`   Mode:   DRY RUN (no files written)\n`);
  else console.log('');

  // 1. Read last sync state
  const state = await readState(projectDir);
  if (state?.url && state.url !== url && !since) {
    console.warn(
      `⚠️  Previous sync state is for ${state.url}; ignoring it for ${url}.`,
    );
  }
  const lastSync = since || (state?.url === url ? state.lastSync : undefined);

  if (lastSync) {
    console.log(`📅 Last sync: ${new Date(lastSync).toLocaleString()}`);
  } else {
    console.log('📅 No previous sync found — pulling all posts');
  }

  // 2. Connect to WP
  const client = createWpClient({
    baseUrl: url,
    mode,
    hmac: hmacSecret ? { secret: hmacSecret } : undefined,
  });

  // 3. Fetch posts modified since last sync
  console.log('\n📡 Fetching modified posts...');

  let allPosts: WPPost[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await client.fetchPosts({
      type,
      page,
      perPage: 100,
      orderBy: 'modified',
      order: 'desc',
      modifiedAfter: lastSync || undefined,
    });

    allPosts = allPosts.concat(result.data);
    totalPages = result.totalPages;
    console.log(
      `   Page ${page}/${totalPages}: ${result.data.length} modified posts`,
    );
    page++;
  } while (page <= totalPages && totalPages > 0);

  if (allPosts.length === 0) {
    console.log('\n✅ No changes detected. Everything up to date!\n');
    return;
  }

  console.log(`   Total: ${allPosts.length} changed posts\n`);

  // 4. Group posts: new vs updated
  const written: string[] = [];
  const skipped: string[] = [];

  if (!dryRun) {
    console.log('📝 Writing files...');

    for (const post of allPosts) {
      const safeType = sanitizePathSegment(type, 'posts');
      const safeSlug = sanitizePathSegment(post.slug, String(post.id));
      const postDir = path.join(contentDir, safeType, safeSlug);
      const mdxPath = path.join(postDir, 'index.mdx');

      // Check if file exists to categorize
      let existed = false;
      try {
        await fs.stat(mdxPath);
        existed = true;
      } catch {
        // file doesn't exist
      }

      const frontmatter = toFrontmatter(post);
      const mdxContent = frontmatter + post.content;

      await fs.mkdir(postDir, { recursive: true });
      await fs.writeFile(mdxPath, mdxContent, 'utf-8');

      const label = existed ? 'U' : 'N';
      console.log(`   [${label}] ${post.slug}`);
      written.push(post.slug);
    }
  } else {
    console.log('🔍 DRY RUN — would create/update:');
    for (const post of allPosts) {
      const safeType = sanitizePathSegment(type, 'posts');
      const safeSlug = sanitizePathSegment(post.slug, String(post.id));
      const postDir = path.join(contentDir, safeType, safeSlug);
      const mdxPath = path.join(postDir, 'index.mdx');
      let existed = false;
      try {
        await fs.stat(mdxPath);
        existed = true;
      } catch {
        // ignore
      }
      const label = existed ? 'U' : 'N';
      console.log(`   [${label}] ${post.slug}`);
      skipped.push(post.slug);
    }
  }

  if (dryRun) {
    console.log(`\n   🔍 ${skipped.length} previewed (${allPosts.length} total)\n`);
  } else {
    console.log(`\n   ✅ ${written.length} updated (${allPosts.length} total)\n`);
  }

  // 5. Update sync state
  if (!dryRun) {
    const maxModified = allPosts
      .map((post) => post.modified)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1);
    const nextWatermark = maxModified || new Date().toISOString();
    const newState: SyncState = {
      lastSync: nextWatermark,
      postCount: allPosts.length,
      url,
    };
    await writeState(projectDir, newState);
    console.log(`💾 Sync state saved: ${nextWatermark}\n`);
  }

  // 6. ISR revalidation
  if (revalidateUrl && !dryRun) {
    console.log('🔄 Triggering ISR revalidation...');
    let ok = 0;
    let fail = 0;

    for (const slug of written) {
      const pagePath = `/${type}/${encodeURIComponent(slug)}`;
      const success = await revalidatePage(
        revalidateUrl,
        pagePath,
        revalidateSecret,
      );
      if (success) ok++;
      else fail++;
    }

    console.log(`   ✅ ${ok} revalidated, ❌ ${fail} failed\n`);
  }

  console.log('✅ Sync complete!\n');
}
