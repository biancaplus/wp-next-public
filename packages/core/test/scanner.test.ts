import { describe, expect, it, vi } from 'vitest';
import { scanWpSite } from '../src/scanner.js';
import type { WPClientOptions } from '../src/types.js';

class MockHeaders {
  private values: Record<string, string>;

  constructor(values: Record<string, string> = {}) {
    this.values = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key.toLowerCase(), value]),
    );
  }

  get(name: string): string | null {
    return this.values[name.toLowerCase()] ?? null;
  }
}

function jsonResponse(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    statusText: init.status === 401 ? 'Unauthorized' : init.status === 404 ? 'Not Found' : 'OK',
    headers: new MockHeaders(init.headers),
    json: async () => data,
  } as Response;
}

function createFetch(): NonNullable<WPClientOptions['fetch']> {
  return vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const path = url.pathname;

    if (path === '/wp-json/wp/v2/types') {
      return jsonResponse({
        post: {
          slug: 'post',
          name: 'Posts',
          rest_base: 'posts',
          has_archive: false,
          supports: ['title', 'editor'],
          taxonomies: ['category', 'post_tag'],
        },
        page: {
          slug: 'page',
          name: 'Pages',
          rest_base: 'pages',
          has_archive: false,
          supports: ['title', 'editor'],
          taxonomies: [],
        },
        attachment: {
          slug: 'attachment',
          name: 'Media',
          rest_base: 'media',
          has_archive: false,
          supports: [],
          taxonomies: [],
        },
        wp_navigation: {
          slug: 'wp_navigation',
          name: 'Navigation',
          rest_base: 'navigation',
          has_archive: false,
          supports: [],
          taxonomies: [],
        },
        elementor_library: {
          slug: 'elementor_library',
          name: 'Elementor Library',
          rest_base: 'elementor_library',
          has_archive: false,
          supports: ['title', 'editor'],
          taxonomies: [],
        },
      });
    }

    if (path === '/wp-json/wp/v2/taxonomies') {
      return jsonResponse({
        category: {
          slug: 'category',
          name: 'Categories',
          rest_base: 'categories',
          types: ['post'],
          hierarchical: true,
        },
        post_tag: {
          slug: 'post_tag',
          name: 'Tags',
          rest_base: 'tags',
          types: ['post'],
          hierarchical: false,
        },
      });
    }

    if (path === '/wp-json/wp/v2/posts') {
      return jsonResponse([
        {
          id: 1,
          slug: 'hello',
          date: '2026-01-01T00:00:00',
          title: { rendered: 'Hello' },
          content: { rendered: '<p>Hello</p>' },
          excerpt: { rendered: 'Hello' },
          status: 'publish',
          type: 'post',
        },
      ], { headers: { 'X-WP-Total': '1', 'X-WP-TotalPages': '1' } });
    }

    if (path === '/wp-json/wp/v2/pages') {
      return jsonResponse([], { headers: { 'X-WP-Total': '0', 'X-WP-TotalPages': '0' } });
    }

    if (path === '/wp-json/wp/v2/categories') {
      return jsonResponse([
        { id: 1, name: 'News', slug: 'news', taxonomy: 'category' },
      ], { headers: { 'X-WP-Total': '1', 'X-WP-TotalPages': '1' } });
    }

    if (path === '/wp-json/wp/v2/tags') {
      return jsonResponse([], { headers: { 'X-WP-Total': '0', 'X-WP-TotalPages': '0' } });
    }

    if (path === '/wp-json/wp/v2/elementor_library') {
      return jsonResponse({ code: 'rest_forbidden' }, { status: 401 });
    }

    if (path === '/wp-json/wp/v2/media') {
      return jsonResponse({ code: 'rest_forbidden' }, { status: 401 });
    }

    throw new Error(`Unexpected request: ${path}`);
  }) as NonNullable<WPClientOptions['fetch']>;
}

describe('scanWpSite', () => {
  it('defaults to front-facing content types and skips media/navigation/plugin types', async () => {
    const fetch = createFetch();

    const scan = await scanWpSite('https://wp.example.com', { fetch });

    expect(scan.postTypes.map((type) => type.slug)).toEqual(['post', 'page']);
    expect(scan.postTypes.find((type) => type.slug === 'post')?.totalPosts).toBe(1);
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('/media'), expect.anything());
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('/navigation'), expect.anything());
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('/elementor_library'), expect.anything());
  });

  it('quietly skips inaccessible explicitly requested post types', async () => {
    const fetch = createFetch();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const scan = await scanWpSite('https://wp.example.com', {
      fetch,
      postTypes: ['post', 'attachment', 'elementor_library'],
    });

    expect(scan.postTypes.map((type) => type.slug)).toEqual(['post']);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
