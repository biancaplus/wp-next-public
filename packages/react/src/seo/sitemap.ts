// @wp-next-public/react — Sitemap & Robots 生成器
// 提供工厂函数，在 Next.js sitemap.ts 中调用

import type { WPPost, WPTerm } from '@wp-next-public/core';

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{ url: string; caption?: string }>;
}

/**
 * 生成符合 Google sitemap 规范的 XML 字符串
 */
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const images = entry.images?.length
        ? entry.images
            .map(
              (img) =>
                `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>${
        img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''
      }
    </image:image>`,
            )
            .join('\n')
        : '';

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${
        entry.lastModified ? `\n    <lastmod>${entry.lastModified}</lastmod>` : ''
      }${
        entry.changeFrequency ? `\n    <changefreq>${entry.changeFrequency}</changefreq>` : ''
      }${entry.priority != null ? `\n    <priority>${entry.priority}</priority>` : ''}${
        images ? `\n${images}` : ''
      }
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;
}

/**
 * 从 WP 文章生成 sitemap entries
 */
export function postsToSitemap(
  posts: WPPost[],
  baseUrl: string,
  postsPath = '/posts',
): SitemapEntry[] {
  return posts.map((post) => ({
    url: `${baseUrl}${postsPath}/${post.slug}`,
    lastModified: post.modified || post.date,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    images: post.featuredMedia?.url
      ? [
          {
            url: post.featuredMedia.url,
            caption: post.featuredMedia.alt || post.title,
          },
        ]
      : undefined,
  }));
}

/**
 * 从 WP 分类/标签生成 sitemap entries
 */
export function termsToSitemap(
  terms: WPTerm[],
  baseUrl: string,
  taxonomyPath: string, // e.g. '/category' or '/tag'
): SitemapEntry[] {
  return terms.map((term) => ({
    url: `${baseUrl}${taxonomyPath}/${term.slug}`,
    changeFrequency: 'weekly' as const,
    priority: taxonomyPath === '/category' ? 0.5 : 0.3,
  }));
}

/**
 * 生成 sitemap index XML（多拆 sitemap）
 *
 * @example
 * ```ts
 * generateSitemapIndex([
 *   { url: 'https://mysite.com/post-sitemap.xml', lastModified: '2026-06-15' },
 *   { url: 'https://mysite.com/category-sitemap.xml', lastModified: '2026-06-15' },
 * ])
 * ```
 */
export function generateSitemapIndex(
  sitemaps: Array<{ url: string; lastModified?: string }>,
): string {
  const entries = sitemaps
    .map(
      (s) =>
        `  <sitemap>
    <loc>${escapeXml(s.url)}</loc>${
          s.lastModified ? `\n    <lastmod>${s.lastModified}</lastmod>` : ''
        }
  </sitemap>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

/**
 * 生成 robots.txt 内容
 */
export function generateRobotsTxt(
  baseUrl: string,
  options?: {
    /** 禁止爬取的路径 */
    disallow?: string[];
    /** Sitemap URL */
    sitemapUrl?: string;
  },
): string {
  const disallow = options?.disallow || [];
  const lines = ['User-agent: *'];

  if (disallow.length > 0) {
    disallow.forEach((path) => lines.push(`Disallow: ${path}`));
  } else {
    lines.push('Disallow:');
  }

  lines.push('');
  lines.push(`Sitemap: ${options?.sitemapUrl || `${baseUrl}/sitemap.xml`}`);

  return lines.join('\n');
}

// ── Helpers ──

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
