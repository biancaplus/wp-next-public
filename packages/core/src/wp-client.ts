// @wp-next-public/core — WP 数据获取客户端
// 支持 WP REST API（标准）和 HMAC 自定义 API（blogset 兼容）

import { decodeHtmlEntities } from './decode-html.js';
import { extractSeoFields } from './extract-seo.js';
import type {
  WPPost,
  WPPage,
  WPTerm,
  WPMedia,
  WPAuthor,
  WPSiteInfo,
  WPPostType,
  WPTaxonomy,
  WPPaginatedResponse,
  WPClientOptions,
} from './types.js';

// ============================================================
// HMAC 签名（blogset 兼容）
// ============================================================

// Web Crypto API HMAC-SHA256 (works in Node 19+, browsers, Edge/Workers)
async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  // Use globalThis.crypto.subtle (Web Crypto API)
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, msgData);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function buildHmacHeaders(secret: string, prefix = 'X-Blogset'): Record<string, string> {
  const nonce = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Note: HMAC-SHA256 with Web Crypto requires async; handled at request time
  // For now, store nonce+timestamp for sign-on-request
  return {
    [`${prefix}-Nonce`]: nonce,
    [`${prefix}-Timestamp`]: timestamp,
  };
}

// ============================================================
// WP REST API 客户端
// ============================================================

export interface WPClient {
  // 站点发现
  discover(): Promise<WPSiteInfo>;

  // 文章
  fetchPosts(options?: FetchPostsOptions): Promise<WPPaginatedResponse<WPPost>>;
  fetchPost(slug: string): Promise<WPPost | null>;
  fetchPages(options?: FetchPostsOptions): Promise<WPPaginatedResponse<WPPage>>;
  fetchPage(slug: string): Promise<WPPage | null>;

  // 分类/标签
  fetchCategories(): Promise<WPTerm[]>;
  fetchTags(): Promise<WPTerm[]>;

  // 媒体
  fetchMedia(id: number): Promise<WPMedia | null>;

  // 作者
  fetchAuthors(): Promise<WPAuthor[]>;
  fetchAuthor(slug: string): Promise<WPAuthor | null>;
}

export interface FetchPostsOptions {
  page?: number;
  perPage?: number;
  /** 筛选文章类型 */
  type?: string;
  /** 按分类 slug 筛选 */
  category?: string;
  /** 按标签 slug 筛选 */
  tag?: string;
  /** 搜索关键词 */
  search?: string;
  /** 排序字段 */
  orderBy?: 'date' | 'title' | 'modified';
  order?: 'asc' | 'desc';
  /** 仅获取在此时间之后修改的文章（ISO 8601） */
  modifiedAfter?: string;
}

interface WPFetchResult<T> {
  data: T;
  total: number;
  totalPages: number;
}

export function createWpClient(options: WPClientOptions): WPClient {
  const { baseUrl, mode = 'rest', hmac, timeout = 10000 } = options;

  if (mode === 'graphql') {
    throw new Error('GraphQL mode is not implemented yet. Use mode: "rest" for now.');
  }

  if (mode === 'hmac' && !hmac?.secret) {
    throw new Error('HMAC mode requires options.hmac.secret.');
  }

  // Remove trailing slash
  const apiBase = baseUrl.replace(/\/$/, '');

  const restBase =
    mode === 'hmac' && hmac ? apiBase : `${apiBase}/wp-json/wp/v2`;

  async function wpFetchWithMeta<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<WPFetchResult<T>> {
    // Build URL
    const url = new URL(`${restBase}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) url.searchParams.set(key, String(val));
      });
    }

    const headers: Record<string, string> = {};

    // HMAC 认证
    if (mode === 'hmac' && hmac) {
      const hmacHeaders = buildHmacHeaders(hmac.secret, hmac.headerPrefix);
      Object.assign(headers, hmacHeaders);
      // Sign with nonce + timestamp
      const message = `${hmacHeaders[`${hmac.headerPrefix || 'X-Blogset'}-Nonce`]}${hmacHeaders[`${hmac.headerPrefix || 'X-Blogset'}-Timestamp`]}`;
      const sig = await hmacSign(message, hmac.secret);
      headers[`${hmac.headerPrefix || 'X-Blogset'}-Sign`] = sig;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchFn = options.fetch ?? fetch;
      const res = await fetchFn(url.toString(), {
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(
          `WP API error: ${res.status} ${res.statusText} for ${path}`,
        );
      }

      const total = Number(res.headers.get('X-WP-Total') || 0);
      const totalPages = Number(res.headers.get('X-WP-TotalPages') || 0);
      const data = (await res.json()) as T;

      return { data, total, totalPages };
    } finally {
      clearTimeout(timer);
    }
  }

  async function wpFetch<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const result = await wpFetchWithMeta<T>(path, params);
    return result.data;
  }

  async function fetchAllPages<T>(
    path: string,
    params: Record<string, string | number | undefined> = {},
    perPage = 100,
  ): Promise<T[]> {
    const all: T[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await wpFetchWithMeta<T[]>(path, {
        ...params,
        page,
        per_page: perPage,
      });
      all.push(...result.data);

      totalPages =
        result.totalPages || (result.data.length === perPage ? page + 1 : page);
      page++;
    } while (page <= totalPages);

    return all;
  }

  // Normalize WP REST API response to WPPost format
  function normalizePost(raw: Record<string, unknown>): WPPost {
    const title =
      typeof raw.title === 'object' && raw.title
        ? (raw.title as { rendered?: string }).rendered || ''
        : String(raw.title || '');
    const content =
      typeof raw.content === 'object' && raw.content
        ? (raw.content as { rendered?: string }).rendered || ''
        : String(raw.content || '');
    const excerpt =
      typeof raw.excerpt === 'object' && raw.excerpt
        ? (raw.excerpt as { rendered?: string }).rendered || ''
        : String(raw.excerpt || '');

    const embedded = raw._embedded as Record<string, unknown[]> | undefined;
    const featuredMediaArr = embedded?.['wp:featuredmedia'] as Array<Record<string, unknown>> | undefined;
    const termArr = embedded?.['wp:term'] as Array<Array<Record<string, unknown>>> | undefined;

    const featuredMedia = featuredMediaArr?.[0]
      ? {
          id: featuredMediaArr[0].id as number,
          url: (featuredMediaArr[0].source_url as string) || '',
          alt: (featuredMediaArr[0].alt_text as string) || '',
        }
      : undefined;

    const categories =
      termArr?.[0]?.map((t) => ({
        id: t.id as number,
        name: t.name as string,
        slug: t.slug as string,
      })) || [];

    const tags =
      termArr?.[1]?.map((t) => ({
        id: t.id as number,
        name: t.name as string,
        slug: t.slug as string,
      })) || [];

    const seo = extractSeoFields(raw);
    const authorArr = embedded?.author as Array<Record<string, unknown>> | undefined;
    const author = authorArr?.[0]
      ? {
          id: authorArr[0].id as number,
          name: String(authorArr[0].name || ''),
          slug: String(authorArr[0].slug || ''),
        }
      : undefined;

    return {
      id: raw.id as number,
      title: decodeHtmlEntities(title),
      slug: String(raw.slug || ''),
      content,
      excerpt: decodeHtmlEntities(excerpt),
      date: String(raw.date || raw.date_gmt || ''),
      modified: String(raw.modified || raw.modified_gmt || ''),
      type: String(raw.type || 'post'),
      status: (raw.status as WPPost['status']) || 'publish',
      featuredMedia,
      categories,
      tags,
      author,
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,
      canonicalUrl: seo.canonicalUrl,
      ogImage: seo.ogImage ?? featuredMedia?.url,
    };
  }

  return {
    // —— 站点发现 ——
    async discover(): Promise<WPSiteInfo> {
      if (mode === 'hmac') {
        // blogset 自定义 API 无标准 discovery，返回基本信息
        return {
          name: new URL(apiBase).hostname,
          description: '',
          url: apiBase,
          home: apiBase,
          postTypes: [
            {
              slug: 'post',
              name: '文章',
              restBase: 'posts',
              hasArchive: true,
              supports: ['title', 'editor', 'thumbnail', 'excerpt'],
              taxonomies: ['category', 'post_tag'],
            },
            {
              slug: 'page',
              name: '页面',
              restBase: 'pages',
              hasArchive: false,
              supports: ['title', 'editor'],
              taxonomies: [],
            },
          ],
          taxonomies: [
            {
              slug: 'category',
              name: '分类',
              restBase: 'categories',
              postTypes: ['post'],
              hierarchical: true,
            },
            {
              slug: 'post_tag',
              name: '标签',
              restBase: 'tags',
              postTypes: ['post'],
              hierarchical: false,
            },
          ],
        };
      }

      // Standard WP REST API discovery
      const [rawTypes, rawTax] = await Promise.all([
        wpFetch<Record<string, Record<string, unknown>>>('/types'),
        wpFetch<Record<string, Record<string, unknown>>>('/taxonomies'),
      ]);

      const typesArr = Object.values(rawTypes || {})
        .filter((t) => t.rest_base !== undefined)
        .map((t) => ({
          slug: String(t.slug || ''),
          name: String(t.name || ''),
          restBase: String(t.rest_base || ''),
          hasArchive: Boolean(t.has_archive),
          supports: (t.supports as string[]) || [],
          taxonomies: (t.taxonomies as string[]) || [],
        } satisfies WPPostType));

      const taxArr = Object.values(rawTax || {})
        .filter((t) => (t as Record<string, unknown>).rest_base !== undefined)
        .map((t) => ({
          slug: String(t.slug || ''),
          name: String(t.name || ''),
          restBase: String((t as Record<string, unknown>).rest_base || ''),
          postTypes: (t.types as string[]) || [],
          hierarchical: Boolean(t.hierarchical),
        } satisfies WPTaxonomy));

      return {
        name: new URL(apiBase).hostname,
        description: '',
        url: apiBase,
        home: apiBase,
        postTypes: typesArr,
        taxonomies: taxArr,
      };
    },

    // —— 文章列表 ——
    async fetchPosts(opts: FetchPostsOptions = {}): Promise<WPPaginatedResponse<WPPost>> {
      const { type = 'posts', page = 1, perPage = 10, ...filters } = opts;
      const params: Record<string, string | number | undefined> = {
        page,
        per_page: perPage,
        _embed: 1,
      };

      if (filters.search) params.search = filters.search;
      if (filters.orderBy) params.orderby = filters.orderBy;
      if (filters.order) params.order = filters.order;
      if (filters.modifiedAfter) params.modified_after = filters.modifiedAfter;

      // blogset HMAC API has different endpoint structure
      if (mode === 'hmac') {
        if (filters.category) params.category = filters.category;
        if (filters.tag) params.tag = filters.tag;
        const result = await wpFetchWithMeta<Record<string, unknown>[]>(
          `/${type}`,
          params,
        );
        const data = result.data.map(normalizePost);
        const totalPages =
          result.totalPages || (data.length === perPage ? page + 1 : page);
        return {
          data,
          total: result.total || data.length,
          totalPages,
          page,
          perPage,
        };
      }

      if (filters.category) {
        const terms = await fetchAllPages<WPTerm>(
          '/categories',
          { slug: filters.category },
          100,
        );
        const term = terms[0];
        params.categories = term?.id ?? 0;
      }

      if (filters.tag) {
        const terms = await fetchAllPages<WPTerm>(
          '/tags',
          { slug: filters.tag },
          100,
        );
        const term = terms[0];
        params.tags = term?.id ?? 0;
      }

      // Standard WP REST API
      const result = await wpFetchWithMeta<Record<string, unknown>[]>(
        `/${type}`,
        params,
      );
      const data = result.data.map(normalizePost);
      const totalPages =
        result.totalPages || (data.length === perPage ? page + 1 : page);
      return {
        data,
        total: result.total || data.length,
        totalPages,
        page,
        perPage,
      };
    },

    // —— 单篇文章 ——
    async fetchPost(slug: string): Promise<WPPost | null> {
      try {
        if (mode === 'hmac') {
          const raw = await wpFetch<Record<string, unknown>[]>(`/posts`);
          const found = raw.find((p) => String(p.slug) === slug);
          return found ? normalizePost(found) : null;
        }
        const raw = await wpFetch<Record<string, unknown>[]>('/posts', { slug, _embed: '1' });
        return raw[0] ? normalizePost(raw[0]) : null;
      } catch {
        return null;
      }
    },

    // —— 页面 ——
    async fetchPages(opts: FetchPostsOptions = {}): Promise<WPPaginatedResponse<WPPage>> {
      const { page = 1, perPage = 10, ...filters } = opts;
      const params: Record<string, string | number | undefined> = {
        page,
        per_page: perPage,
      };
      if (filters.search) params.search = filters.search;

      const result = await wpFetchWithMeta<WPPage[]>('/pages', params);
      const totalPages =
        result.totalPages || (result.data.length === perPage ? page + 1 : page);
      return {
        data: result.data,
        total: result.total || result.data.length,
        totalPages,
        page,
        perPage,
      };
    },

    async fetchPage(slug: string): Promise<WPPage | null> {
      try {
        const pages = await wpFetch<WPPage[]>('/pages', { slug });
        return pages[0] || null;
      } catch {
        return null;
      }
    },

    // —— 分类/标签 ——
    async fetchCategories(): Promise<WPTerm[]> {
      if (mode === 'hmac') {
        return wpFetch<WPTerm[]>('/categories');
      }
      return fetchAllPages<WPTerm>('/categories');
    },

    async fetchTags(): Promise<WPTerm[]> {
      if (mode === 'hmac') {
        return wpFetch<WPTerm[]>('/tags');
      }
      return fetchAllPages<WPTerm>('/tags');
    },

    // —— 媒体 ——
    async fetchMedia(id: number): Promise<WPMedia | null> {
      try {
        return wpFetch<WPMedia>(`/media/${id}`);
      } catch {
        return null;
      }
    },

    // —— 作者 ——
    async fetchAuthors(): Promise<WPAuthor[]> {
      try {
        if (mode === 'hmac') {
          return wpFetch<WPAuthor[]>('/users');
        }
        return fetchAllPages<WPAuthor>('/users');
      } catch {
        return [];
      }
    },

    async fetchAuthor(slug: string): Promise<WPAuthor | null> {
      try {
        const users = await wpFetch<WPAuthor[]>('/users', { slug });
        return users[0] || null;
      } catch {
        return null;
      }
    },
  };
}
