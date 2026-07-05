// @wp-next/cli — wp-next pull 命令
// 从 WP 站点拉取内容 → 生成 MDX 文件 → 下载媒体

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { WPPost, DataSourceMode } from '@wp-next/core';
import { createWpClient } from '@wp-next/core';
import type { WPClient } from '@wp-next/core';
import { toFrontmatter } from '../lib/frontmatter.js';

export interface PullOptions {
  url: string;
  mode?: DataSourceMode;
  hmacSecret?: string;
  output?: string;
  all?: boolean;
  type?: string;
  format?: 'mdx' | 'json';
}

interface MediaDownload {
  id: number;
  url: string;
  destPath: string;
}

function sanitizePathSegment(value: string, fallback: string): string {
  const safe = value
    .trim()
    .replace(/[/\\]/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');

  return safe || fallback;
}

function resolveInside(rootDir: string, ...segments: string[]): string {
  const root = path.resolve(rootDir);
  const target = path.resolve(root, ...segments);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside project directory: ${target}`);
  }

  return target;
}

function isAllowedMediaUrl(mediaUrl: string, siteUrl: string): boolean {
  try {
    const media = new URL(mediaUrl);
    const site = new URL(siteUrl);

    return (
      (media.protocol === 'https:' || media.protocol === 'http:') &&
      media.hostname === site.hostname
    );
  } catch {
    return false;
  }
}

/**
 * Download a media file from URL to local disk
 */
async function downloadMedia(
  mediaUrl: string,
  destPath: string,
  siteUrl: string,
): Promise<void> {
  try {
    if (!isAllowedMediaUrl(mediaUrl, siteUrl)) {
      console.warn(`  ⚠️  Skipped unsafe media URL: ${mediaUrl}`);
      return;
    }

    const res = await fetch(mediaUrl);
    if (!res.ok) {
      console.warn(`  ⚠️  Failed to download: ${mediaUrl}`);
      return;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, buffer);
  } catch (err) {
    console.warn(`  ⚠️  Download error: ${mediaUrl} — ${(err as Error).message}`);
  }
}

/**
 * wp-next pull 命令主逻辑
 *
 * 1. 连接 WP API
 * 2. 分页拉取所有文章
 * 3. 生成 MDX 文件（frontmatter + 内容）
 * 4. 下载 featured images
 * 5. 输出到 content/ 目录
 */
export async function pullCommand(opts: PullOptions): Promise<void> {
  const {
    url,
    mode = 'rest',
    hmacSecret,
    output = 'content',
    all = false,
    type = 'posts',
    format = 'mdx',
  } = opts;

  const projectDir = process.cwd();
  const contentDir = path.resolve(projectDir, output);

  console.log(`\n📥 wp-next pull`);
  console.log(`   URL:    ${url}`);
  console.log(`   Mode:   ${mode}`);
  console.log(`   Type:   ${type}`);
  console.log(`   Output: ${contentDir}\n`);

  // 1. Create client
  const client = createWpClient({
    baseUrl: url,
    mode,
    hmac: hmacSecret ? { secret: hmacSecret } : undefined,
  });

  // 2. Pull posts (paginated)
  console.log('📡 Fetching posts...');

  let allPosts: WPPost[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await client.fetchPosts({
      type,
      page,
      perPage: all ? 100 : 10,
    });

    allPosts = allPosts.concat(result.data);
    totalPages = result.totalPages;
    console.log(
      `   Page ${page}/${totalPages}: ${result.data.length} posts`,
    );

    page++;
  } while (all && page <= totalPages);

  console.log(`   Total: ${allPosts.length} posts\n`);

  // 3. Generate output files
  const mediaDownloads: MediaDownload[] = [];
  const safeType = sanitizePathSegment(type, 'posts');

  console.log(`📝 Generating ${format.toUpperCase()} files...`);

  for (const post of allPosts) {
    const safeSlug = sanitizePathSegment(post.slug, String(post.id));
    const postDir = resolveInside(contentDir, safeType, safeSlug);

    if (format === 'mdx') {
      const frontmatter = toFrontmatter(post);
      const mdxContent = frontmatter + post.content;

      await fs.mkdir(postDir, { recursive: true });
      await fs.writeFile(
        path.join(postDir, 'index.mdx'),
        mdxContent,
        'utf-8',
      );
    } else {
      // JSON format
      await fs.mkdir(postDir, { recursive: true });
      await fs.writeFile(
        path.join(postDir, 'index.json'),
        JSON.stringify(post, null, 2),
        'utf-8',
      );
    }

    // Track media for download
    if (post.featuredMedia?.url) {
      try {
        const ext = path.extname(new URL(post.featuredMedia.url).pathname) || '.jpg';
        mediaDownloads.push({
          id: post.id,
          url: post.featuredMedia.url,
          destPath: resolveInside(
            projectDir,
            'public',
            'images',
            `${safeSlug}${ext}`,
          ),
        });
      } catch {
        console.warn(`  ⚠️  Skipped invalid media URL: ${post.featuredMedia.url}`);
      }
    }
  }

  console.log(`   ✅ ${allPosts.length} files written\n`);

  // 4. Download media
  if (mediaDownloads.length > 0) {
    console.log(`🖼️  Downloading ${mediaDownloads.length} images...`);
    let downloaded = 0;

    for (const media of mediaDownloads) {
      await downloadMedia(
        media.url,
        media.destPath,
        url,
      );
      downloaded++;
      if (downloaded % 10 === 0) {
        console.log(`   ${downloaded}/${mediaDownloads.length}`);
      }
    }

    console.log(`   ✅ ${downloaded} images downloaded\n`);
  }

  // 5. Summary
  console.log('✅ Pull complete!\n');
  console.log('📁 Output:');
  console.log(`   ${contentDir}/`);
  if (mediaDownloads.length > 0) {
    console.log(`   public/images/ (${mediaDownloads.length} images)`);
  }
  console.log('');
}
