// @wp-next-public/react — JSON-LD 结构化数据组件
// 用于插入 <script type="application/ld+json"> 到页面中

import type { WPPost, WPSiteInfo } from '@wp-next-public/core';

/**
 * Article JSON-LD
 *
 * 插入到文章详情页的 <head> 或 <body> 中
 *
 * @example
 * ```tsx
 * <ArticleJsonLd post={post} site={site} baseUrl="https://mysite.com" />
 * ```
 */
export function ArticleJsonLd({
  post,
  site,
  baseUrl,
  postsPath = '/posts',
}: {
  post: WPPost;
  site?: WPSiteInfo;
  baseUrl?: string;
  postsPath?: string;
}) {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    datePublished: post.date,
    dateModified: post.modified || post.date,
    author: post.author?.name
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : undefined,
    publisher: site?.name
      ? {
          '@type': 'Organization',
          name: site.name,
        }
      : undefined,
    image: post.featuredMedia?.url || post.ogImage || undefined,
    mainEntityOfPage: baseUrl
      ? {
          '@type': 'WebPage',
          '@id': `${baseUrl}${postsPath}/${post.slug}`,
        }
      : undefined,
  };

  // Remove undefined values
  const cleaned = JSON.parse(JSON.stringify(json));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleaned, null, 2) }}
    />
  );
}

/**
 * BreadcrumbList JSON-LD
 *
 * @param items - 面包屑项，从根到当前页
 *
 * @example
 * ```tsx
 * <BreadcrumbJsonLd items={[
 *   { name: 'Home', url: '/' },
 *   { name: 'Blog', url: '/posts' },
 *   { name: post.title, url: `/posts/${post.slug}` },
 * ]} />
 * ```
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url?: string }>;
}) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

/**
 * Organization JSON-LD
 *
 * 用于首页或全局布局
 */
export function OrganizationJsonLd({
  site,
  baseUrl,
  logo,
}: {
  site: WPSiteInfo;
  baseUrl: string;
  logo?: string;
}) {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: baseUrl,
    description: site.description || undefined,
    logo: logo || undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
