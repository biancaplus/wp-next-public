import { describe, expect, it } from 'vitest';
import { createWpClient } from '../src/wp-client.js';

function jsonResponse(
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

describe('createWpClient', () => {
  it('reads WordPress pagination headers for posts', async () => {
    const fetchCalls: string[] = [];
    const client = createWpClient({
      baseUrl: 'https://wp.example.com',
      fetch: async (input) => {
        fetchCalls.push(String(input));
        return jsonResponse(
          [
            {
              id: 1,
              slug: 'hello',
              title: { rendered: 'Hello' },
              content: { rendered: '<p>Hello</p>' },
              excerpt: { rendered: 'Hello' },
              date: '2026-01-01T00:00:00',
              modified: '2026-01-02T00:00:00',
            },
          ],
          {
            'X-WP-Total': '150',
            'X-WP-TotalPages': '2',
          },
        );
      },
    });

    const result = await client.fetchPosts({ page: 1, perPage: 100 });

    expect(result.total).toBe(150);
    expect(result.totalPages).toBe(2);
    expect(result.data[0]?.slug).toBe('hello');
    expect(fetchCalls[0]).toContain('per_page=100');
  });

  it('decodes HTML entities in normalized post titles', async () => {
    const client = createWpClient({
      baseUrl: 'https://wp.example.com',
      fetch: async () =>
        jsonResponse([
          {
            id: 1,
            slug: 'child-theme',
            title: { rendered: 'WordPress &#8211; child theme' },
            content: { rendered: '<p>Body</p>' },
            excerpt: { rendered: '<p>Intro &hellip;</p>' },
            date: '2026-01-01T00:00:00',
            modified: '2026-01-02T00:00:00',
          },
        ]),
    });

    const result = await client.fetchPosts({ perPage: 1 });

    expect(result.data[0]?.title).toBe('WordPress – child theme');
    expect(result.data[0]?.excerpt).toBe('<p>Intro …</p>');
  });

  it('maps Yoast SEO fields into normalized post metadata', async () => {
    const client = createWpClient({
      baseUrl: 'https://wp.example.com',
      fetch: async () =>
        jsonResponse([
          {
            id: 1,
            slug: 'seo-post',
            title: { rendered: 'Post title' },
            content: { rendered: '<p>Body</p>' },
            excerpt: { rendered: 'Excerpt' },
            date: '2026-01-01T00:00:00',
            modified: '2026-01-02T00:00:00',
            yoast_head_json: {
              title: 'Yoast SEO title',
              description: 'Yoast SEO description',
              canonical: 'https://wp.example.com/seo-post/',
              og_image: [{ url: 'https://wp.example.com/og.jpg' }],
            },
          },
        ]),
    });

    const post = await client.fetchPost('seo-post');

    expect(post?.seoTitle).toBe('Yoast SEO title');
    expect(post?.seoDescription).toBe('Yoast SEO description');
    expect(post?.canonicalUrl).toBe('https://wp.example.com/seo-post/');
    expect(post?.ogImage).toBe('https://wp.example.com/og.jpg');
  });

  it('falls back to another page when pagination headers are missing and the page is full', async () => {
    let page = 0;
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name: `Category ${index + 1}`,
      slug: `cat-${index + 1}`,
    }));
    const client = createWpClient({
      baseUrl: 'https://wp.example.com',
      fetch: async () => {
        page++;
        return jsonResponse(
          page === 1
            ? firstPage
            : [{ id: 101, name: 'Category 101', slug: 'cat-101' }],
        );
      },
    });

    const result = await client.fetchCategories();

    expect(result).toHaveLength(101);
    expect(result.at(-1)?.slug).toBe('cat-101');
  });
});
