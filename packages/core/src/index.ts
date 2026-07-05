// @wp-next/core — WordPress 核心工具库
// 类型定义、REST API 客户端、站点扫描器

// Types
export type {
  WPSiteInfo,
  WPPostType,
  WPTaxonomy,
  WPTerm,
  WPMedia,
  WPAuthor,
  WPPost,
  WPPage,
  WPPaginatedResponse,
  WPError,
  DataSourceMode,
  WPClientOptions,
} from './types.js';

// Client
export type { WPClient, FetchPostsOptions } from './wp-client.js';
export { createWpClient } from './wp-client.js';

// Cached client
export type { CacheConfig } from './cached-client.js';
export { createCachedWpClient } from './cached-client.js';

// Scanner
export type { ScanResult, PostTypeScan, ScanOptions } from './scanner.js';
export { scanWpSite } from './scanner.js';

// Text utilities
export { decodeHtmlEntities } from './decode-html.js';
export { extractSeoFields } from './extract-seo.js';
export type { ExtractedSeo } from './extract-seo.js';

export const VERSION = '0.1.0';
