// @wp-next/core — 带缓存的 WP 客户端
// 在内存中缓存 API 响应，支持按端点类型配置 TTL

import type {
  WPPost,
  WPPage,
  WPTerm,
  WPMedia,
  WPAuthor,
  WPSiteInfo,
  WPPaginatedResponse,
  WPClientOptions,
} from './types.js';
import type { WPClient, FetchPostsOptions } from './wp-client.js';
import { createWpClient } from './wp-client.js';

export interface CacheConfig {
  /** 列表页缓存 TTL（秒）。0 = 不缓存 */
  list?: number;
  /** 详情页缓存 TTL（秒）。false = 不缓存（等 webhook） */
  detail?: number | false;
  /** 分类/标签缓存 TTL（秒） */
  taxonomy?: number;
  /** 作者缓存 TTL（秒） */
  author?: number;
  /** 自定义缓存键生成 */
  cacheKey?: (path: string, params?: Record<string, string | number | undefined>) => string;
}

interface CacheEntry<T> {
  data: T;
  expireAt: number;
}

/**
 * 创建一个带内存缓存的 WPClient
 *
 * @example
 * ```ts
 * const wp = createCachedWpClient({
 *   url: 'https://mysite.com',
 *   revalidate: {
 *     list: 300,     // 列表 5 分钟
 *     detail: false,  // 详情不缓存（等 webhook）
 *     taxonomy: 600,  // 分类 10 分钟
 *   },
 * });
 * ```
 */
export function createCachedWpClient(
  options: WPClientOptions & {
    /** 缓存配置 */
    revalidate?: CacheConfig;
    /** 最大缓存条目数（默认 1000） */
    maxCacheSize?: number;
  },
): WPClient & {
  /** 手动清除所有缓存 */
  clearCache: () => void;
  /** 手动清除特定缓存键 */
  invalidate: (pattern: string) => void;
} {
  const { revalidate = {}, maxCacheSize = 1000 } = options;
  const client = createWpClient(options);

  // In-memory cache: Map<key, { data, expireAt }>
  const cache = new Map<string, CacheEntry<unknown>>();

  const defaultKeyFn: NonNullable<CacheConfig['cacheKey']> = (path, params) => {
    if (!params || Object.keys(params).length === 0) return path;
    const sorted = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return sorted ? `${path}?${sorted}` : path;
  };

  const cacheKeyFn = revalidate.cacheKey || defaultKeyFn;

  function getTTL(path: string): number | false {
    // Detail pages: /posts/slug, /pages/slug, /media/id
    if (
      /^\/(posts|pages)(\/[^/]+)?$/.test(path) &&
      !path.endsWith('/posts') &&
      !path.endsWith('/pages')
    ) {
      return revalidate.detail ?? false;
    }
    // List pages: /posts, /pages
    if (/^\/(posts|pages)$/.test(path)) {
      return revalidate.list ?? 0;
    }
    // Taxonomies
    if (/^\/(categories|tags)/.test(path)) {
      return revalidate.taxonomy ?? 0;
    }
    // Authors
    if (/^\/users/.test(path)) {
      return revalidate.author ?? 0;
    }
    // Default: no cache
    return 0;
  }

  function cachedFetch<T>(
    path: string,
    params: Record<string, string | number | undefined> = {},
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const ttl = getTTL(path);

    if (ttl === 0 || ttl === false) {
      return fetcher();
    }

    const key = cacheKeyFn(path, params);
    const entry = cache.get(key);

    if (entry && entry.expireAt > Date.now()) {
      return Promise.resolve(entry.data as T);
    }

    return fetcher().then((data) => {
      // Evict oldest if over max
      if (cache.size >= maxCacheSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }

      cache.set(key, {
        data,
        expireAt: Date.now() + ttl * 1000,
      });

      return data;
    });
  }

  function clearCache() {
    cache.clear();
  }

  function invalidate(pattern: string) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  }

  // Patch the fetchPosts to wrap with cache
  const originalFetchPosts = client.fetchPosts.bind(client);
  const originalFetchPost = client.fetchPost.bind(client);
  const originalFetchPages = client.fetchPages.bind(client);
  const originalFetchPage = client.fetchPage.bind(client);
  const originalFetchCategories = client.fetchCategories.bind(client);
  const originalFetchTags = client.fetchTags.bind(client);
  const originalFetchMedia = client.fetchMedia.bind(client);
  const originalFetchAuthors = client.fetchAuthors.bind(client);
  const originalFetchAuthor = client.fetchAuthor.bind(client);
  const originalDiscover = client.discover.bind(client);

  return {
    ...client,

    async discover() {
      return cachedFetch('/site', undefined, () => originalDiscover());
    },

    async fetchPosts(opts?: FetchPostsOptions) {
      const { type = 'posts', page = 1, perPage = 10, ...filters } = opts || {};
      return cachedFetch(`/${type}`, { page, per_page: perPage, ...filters }, () =>
        originalFetchPosts(opts),
      );
    },

    async fetchPost(slug: string) {
      return cachedFetch('/posts/detail', { slug }, () => originalFetchPost(slug));
    },

    async fetchPages(opts?: FetchPostsOptions) {
      const { page = 1, perPage = 10, ...filters } = opts || {};
      return cachedFetch('/pages', { page, per_page: perPage, ...filters }, () =>
        originalFetchPages(opts),
      );
    },

    async fetchPage(slug: string) {
      return cachedFetch('/pages/detail', { slug }, () => originalFetchPage(slug));
    },

    async fetchCategories() {
      return cachedFetch('/categories', {}, () => originalFetchCategories());
    },

    async fetchTags() {
      return cachedFetch('/tags', {}, () => originalFetchTags());
    },

    async fetchMedia(id: number) {
      return cachedFetch('/media/detail', { id }, () => originalFetchMedia(id));
    },

    async fetchAuthors() {
      return cachedFetch('/users', {}, () => originalFetchAuthors());
    },

    async fetchAuthor(slug: string) {
      return cachedFetch('/users/detail', { slug }, () => originalFetchAuthor(slug));
    },

    clearCache,
    invalidate,
  };
}
