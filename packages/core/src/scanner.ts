// @wp-next/core — WP 站点扫描器
// 自动发现 post types、taxonomies、内容结构

import type {
  DataSourceMode,
  WPSiteInfo,
  WPClientOptions,
  WPPost,
  WPTerm,
  WPPaginatedResponse,
} from './types.js';
import type { WPClient, FetchPostsOptions } from './wp-client.js';
import { createWpClient } from './wp-client.js';

export interface ScanResult {
  site: WPSiteInfo;
  postTypes: PostTypeScan[];
  createdAt: string;
}

export interface PostTypeScan {
  slug: string;
  name: string;
  restBase: string;
  totalPosts: number;
  samplePosts: WPPost[];
  categories: WPTerm[];
  tags: WPTerm[];
}

export interface ScanOptions {
  /** 每个 post type 取样数量 */
  sampleSize?: number;
  /** 只扫描指定的 post types */
  postTypes?: string[];
  /** 数据源模式 */
  mode?: DataSourceMode;
  /** HMAC 认证（blogset 兼容） */
  hmac?: WPClientOptions['hmac'];
  /** 自定义 fetch（测试、代理、日志注入） */
  fetch?: WPClientOptions['fetch'];
}

const NON_FRONT_FACING_POST_TYPES = new Set([
  'attachment',
  'nav_menu_item',
  'wp_block',
  'wp_template',
  'wp_template_part',
  'wp_global_styles',
  'wp_navigation',
  'wp_font_family',
  'wp_font_face',
  'elementor_library',
  'e-floating-buttons',
]);

function isDefaultFrontFacingPostType(pt: WPSiteInfo['postTypes'][number]): boolean {
  if (NON_FRONT_FACING_POST_TYPES.has(pt.slug)) return false;
  if (pt.slug.startsWith('wp_')) return false;
  if (pt.slug === 'post' || pt.slug === 'page') return true;
  return pt.hasArchive && pt.supports.includes('editor');
}

function isExpectedInaccessibleError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /WP API error: (401|403|404)\b/.test(message);
}

/**
 * 扫描一个 WP 站点，自动发现所有内容类型和数据结构
 *
 * @param url - WP 站点地址
 * @param opts - 扫描选项
 * @returns 扫描结果
 *
 * @example
 * ```ts
 * const scan = await scanWpSite('https://my-wp.com');
 * console.log(scan.postTypes); // [{ slug: 'post', totalPosts: 42 }, ...]
 * ```
 */
export async function scanWpSite(
  url: string,
  opts: ScanOptions = {},
): Promise<ScanResult> {
  const { sampleSize = 5, postTypes: filterTypes, mode, hmac, fetch } = opts;

  const client = createWpClient({ baseUrl: url, mode, hmac, fetch });

  // 1. 发现站点结构
  const site = await client.discover();

  // 2. 筛选要扫描的类型。默认只扫描前台内容类型，避免媒体、导航、模板、
  // Elementor 库等内部类型生成无意义路由或产生匿名 401/404 噪音。
  const typesToScan = filterTypes
    ? site.postTypes.filter((t) => filterTypes.includes(t.slug))
    : site.postTypes.filter(isDefaultFrontFacingPostType);

  // 3. 逐一扫描每个 post type
  const postTypeScans: PostTypeScan[] = [];

  for (const pt of typesToScan) {
    try {
      // 拉取样本文章
      const result = await client.fetchPosts({
        type: pt.restBase,
        perPage: sampleSize,
      });

      const ptypeTax = site.taxonomies.filter((t) =>
        t.postTypes.includes(pt.slug),
      );

      const categoryTax = ptypeTax.find((t) => t.hierarchical);
      const tagTax = ptypeTax.find((t) => !t.hierarchical);

      // 拉取分类和标签
      let categories: WPTerm[] = [];
      let tags: WPTerm[] = [];

      try {
        categories = categoryTax ? await client.fetchCategories() : [];
      } catch {
        // 忽略获取失败
      }
      try {
        tags = tagTax ? await client.fetchTags() : [];
      } catch {
        // 忽略获取失败
      }

      postTypeScans.push({
        slug: pt.slug,
        name: pt.name,
        restBase: pt.restBase,
        totalPosts: result.total,
        samplePosts: result.data,
        categories,
        tags,
      });
    } catch (err) {
      // 某个类型扫描失败不阻塞其他类型。真实 WP 会暴露模板、菜单、
      // Elementor 等匿名不可读类型；这类 401/403/404 默认安静跳过，
      // 避免生成空路由和吓人的日志。
      if (!isExpectedInaccessibleError(err)) {
        console.warn(`[wp-next] 扫描 ${pt.slug} 失败:`, err);
      }
    }
  }

  return {
    site,
    postTypes: postTypeScans,
    createdAt: new Date().toISOString(),
  };
}
