// @wp-next-public/react — HTML content renderer with pluggable processor pipeline
// Based on Frontity's html2react pattern: dangerouslySetInnerHTML + processors

// Core
export { ContentRenderer } from './content-renderer.js';
export type { ContentRendererProps } from './content-renderer.js';

// Processor interface
export type { ContentProcessor } from './processor.js';

// Built-in processors
export { imageProcessor } from './processors/image.js';
export { codeProcessor } from './processors/code.js';
export { linkProcessor } from './processors/link.js';

// Sanitizer
export { sanitizeHtml } from './sanitize.js';

// SEO
export {
  createPostMeta,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  renderSitemapXml,
  postsToSitemap,
  termsToSitemap,
  generateSitemapIndex,
  generateRobotsTxt,
} from './seo/index.js';
export type { PostMetaOptions, SitemapEntry } from './seo/index.js';

export const VERSION = '0.1.0';
