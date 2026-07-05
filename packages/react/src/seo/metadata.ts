// @wp-next/react — Next.js generateMetadata 工厂
// 从 WPPost 提取 SEO 元数据，兼容 Yoast / RankMath / AIOSEO

import type { Metadata } from 'next';
import type { WPPost, WPSiteInfo } from '@wp-next/core';
import { decodeHtmlEntities } from '@wp-next/core';

export interface PostMetaOptions {
  /** WP 文章数据 */
  post: WPPost;
  /** 站点信息（用于 siteName 等全局字段） */
  site?: WPSiteInfo;
  /** 网站基础 URL（用于 canonical / og:url） */
  baseUrl?: string;
  /** 分类/标签页路径前缀 */
  postsPath?: string; // default: '/posts'
  /** 是否追加站点名到标题 */
  withSiteName?: boolean;
}

/**
 * 从 WPPost 生成 Next.js generateMetadata 返回的 Metadata 对象
 *
 * @example
 * ```ts
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const post = await getPost(params.slug);
 *   return createPostMeta({ post, baseUrl: 'https://mysite.com' });
 * }
 * ```
 */
export function createPostMeta(opts: PostMetaOptions): Metadata {
  const { post, site, baseUrl, postsPath = '/posts', withSiteName = true } = opts;
  const siteName = site?.name;

  // Title: SEO plugin title already includes site branding; otherwise append site name.
  const rawTitle = post.seoTitle || post.title;
  const title =
    withSiteName && siteName && !post.seoTitle
      ? `${rawTitle} | ${siteName}`
      : rawTitle;

  // Description: seoDescription > plain-text excerpt
  const description = post.seoDescription || plainText(post.excerpt || '');

  // Canonical URL: prefer headless front URL, fall back to plugin canonical
  const canonical =
    baseUrl && post.slug
      ? `${baseUrl.replace(/\/$/, '')}${postsPath}/${post.slug}`
      : post.canonicalUrl;

  // Open Graph
  const ogImage = post.ogImage || post.featuredMedia?.url;
  const ogType = 'article';

  // Robots
  const robots = post.status === 'publish'
    ? undefined // published = indexable
    : { index: false, follow: false };

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      type: ogType as 'article',
      url: canonical,
      siteName: siteName || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
      publishedTime: post.date || undefined,
      modifiedTime: post.modified || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    robots,
    // Keywords from WP tags
    keywords: Array.isArray(post.tags) && post.tags.length > 0
      ? (post.tags as Array<{ name: string }>).map((t) => t.name)
      : undefined,
    // Article metadata for Google
    other: filterUndefined({
      'article:published_time': post.date || undefined,
      'article:modified_time': post.modified || undefined,
      'article:author': post.author?.name || undefined,
    }),
  };
}

/**
 * Strip undefined values from a record, returning a clean object
 */
function filterUndefined(record: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(record)) {
    if (val !== undefined) result[key] = val;
  }
  return result;
}

function plainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}
