// @wp-next/core — 核心类型定义
// 基于 WP REST API 标准响应格式，兼容 blogset 自定义 API

// ============================================================
// WP 站点元信息
// ============================================================

export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  postTypes: WPPostType[];
  taxonomies: WPTaxonomy[];
}

export interface WPPostType {
  slug: string; // 'post', 'page', 'product'
  name: string; // '文章', '页面', '产品'
  restBase: string; // 'posts', 'pages', 'products'
  hasArchive: boolean;
  supports: string[];
  taxonomies: string[];
}

export interface WPTaxonomy {
  slug: string; // 'category', 'post_tag'
  name: string; // '分类', '标签'
  restBase: string; // 'categories', 'tags'
  postTypes: string[];
  hierarchical: boolean; // true = category, false = tag
}

// ============================================================
// 通用 WP 实体类型
// ============================================================

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
  description?: string;
  count?: number;
  parent?: number;
}

export interface WPMedia {
  id: number;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizes?: Record<string, { url: string; width: number; height: number }>;
}

export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  description?: string;
  url?: string;
}

// ============================================================
// 核心文章类型（标准 WP REST API + blogset 兼容）
// ============================================================

export interface WPPost {
  id: number;
  title: string;
  slug: string;
  content: string; // HTML 正文
  excerpt: string;
  date: string; // ISO 8601
  modified?: string; // ISO 8601
  type?: string; // 'post', 'page' etc
  status?: 'publish' | 'draft' | 'pending' | 'private';

  // 媒体
  featuredMedia?: WPMedia;
  cover?: WPMedia; // blogset 自定义字段

  // 分类/标签（ID 数组 或 完整 WPTerm 对象数组）
  categories?: number[] | WPTerm[];
  tags?: number[] | WPTerm[];

  // 嵌入数据（通过 ?_embed 参数获取）
  _embedded?: {
    author?: Array<{ name: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text?: string }>;
    'wp:term'?: WPTerm[][];
  };

  // 作者
  author?: WPAuthor;

  // SEO（Yoast/RankMath/AIOSEO）
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;

  // blogset 兼容字段
  readingTime?: string;
  publishedAt?: string; // 格式化日期
  modifiedAt?: string;
}

export interface WPPage extends WPPost {
  parent?: number;
  menuOrder?: number;
}

// ============================================================
// API 响应类型
// ============================================================

export interface WPPaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

export interface WPError {
  code: string;
  message: string;
  data?: { status: number };
}

// ============================================================
// wp-next 内部类型
// ============================================================

export type DataSourceMode = 'rest' | 'graphql' | 'hmac';

export interface WPClientOptions {
  baseUrl: string;
  mode?: DataSourceMode;
  /** HMAC 认证（blogset 兼容） */
  hmac?: {
    secret: string;
    headerPrefix?: string; // 默认 'X-Blogset'
  };
  /** 请求超时（毫秒） */
  timeout?: number;
  /** 自定义 fetch（用于注入日志/重试） */
  fetch?: typeof fetch;
}
