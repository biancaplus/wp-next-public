// @wp-next/react/seo — SEO 工具集

export { createPostMeta } from './metadata.js';
export type { PostMetaOptions } from './metadata.js';

export { ArticleJsonLd, BreadcrumbJsonLd, OrganizationJsonLd } from './json-ld.js';

export {
  renderSitemapXml,
  postsToSitemap,
  termsToSitemap,
  generateSitemapIndex,
  generateRobotsTxt,
} from './sitemap.js';
export type { SitemapEntry } from './sitemap.js';
