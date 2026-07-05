// @wp-next/cli — wp-next init 命令
// 扫描 WP 站点 → 生成 Next.js 项目骨架

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { scanWpSite } from '@wp-next/core';
import { writeFiles } from '../generators/file-writer.js';
import { generateProject } from '../generators/route-generator.js';
import type { DataSourceMode } from '@wp-next/core';

export interface InitOptions {
  url: string;
  mode?: DataSourceMode;
  hmacSecret?: string;
  output?: string;
  template?: 'minimal' | 'blog' | 'full';
  postTypes?: string;
  ssg?: boolean;
}

async function assertOutputDirectoryIsSafe(projectDir: string): Promise<void> {
  try {
    const entries = await fs.readdir(projectDir);
    const meaningfulEntries = entries.filter((entry) => entry !== '.git');

    if (meaningfulEntries.length > 0) {
      throw new Error(
        `Output directory is not empty: ${projectDir}. Choose a new --output path.`,
      );
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw err;
  }
}

/**
 * wp-next init 命令主逻辑
 *
 * 1. 扫描 WP 站点
 * 2. 生成 Next.js 项目文件
 * 3. 写入磁盘
 */
export async function initCommand(opts: InitOptions): Promise<void> {
  const {
    url,
    mode = 'rest',
    hmacSecret,
    output = '.',
    template = 'blog',
    postTypes: postTypesFilter,
    ssg = false,
  } = opts;

  // Resolve output directory
  const projectDir = path.resolve(output);
  const projectName = path.basename(projectDir);

  console.log(`\n🚀 wp-next init`);
  console.log(`   URL:      ${url}`);
  console.log(`   Mode:     ${mode}`);
  console.log(`   Template: ${template}`);
  console.log(`   Output:   ${projectDir}\n`);

  await assertOutputDirectoryIsSafe(projectDir);

  // 1. Scan WP site
  console.log('📡 Scanning WordPress site...');
  const scan = await scanWpSite(url, {
    sampleSize: 5,
    postTypes: postTypesFilter?.split(',').map((s) => s.trim()),
    mode,
    hmac: hmacSecret ? { secret: hmacSecret } : undefined,
  });

  console.log(
    `   Found: ${scan.postTypes.length} post types, ` +
      `${scan.site.taxonomies.length} taxonomies`,
  );
  for (const pt of scan.postTypes) {
    console.log(`   - ${pt.name} (${pt.slug}): ${pt.totalPosts} items`);
  }

  // 2. Generate project files
  console.log('\n📝 Generating Next.js project...');
  const project = await generateProject(scan, projectName, {
    mode: ssg ? 'ssg' : 'ssr',
    dataMode: mode === 'hmac' ? 'hmac' : 'rest',
    template,
  });

  // 3. Write files
  console.log(`\n📂 Writing ${project.files.length} files...`);
  const created = await writeFiles(projectDir, project.files);

  // 4. Summary
  console.log('\n✅ Project generated successfully!\n');
  console.log(`📁 ${projectDir}`);
  console.log('\n📋 Routes:');
  for (const route of project.routeSummary) {
    console.log(`   ${route}`);
  }

  console.log('\n📦 Next steps:');
  console.log(`   cd ${projectName}`);
  console.log('   npm install');
  console.log('   npm run dev');
  console.log('');
}
