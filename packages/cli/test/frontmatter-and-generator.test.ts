import { describe, expect, it } from 'vitest';
import { toFrontmatter } from '../src/lib/frontmatter.js';
import { generateProject } from '../src/generators/route-generator.js';
import type { ScanResult, WPPost } from '@wp-next-public/core';

describe('toFrontmatter', () => {
  it('serializes unsafe strings as valid YAML frontmatter', () => {
    const frontmatter = toFrontmatter({
      id: 1,
      title: 'Title with "quotes"\nand newline: value',
      slug: 'hello-world',
      content: '<p>Hello</p>',
      excerpt: 'Excerpt',
      date: '2026-01-01T00:00:00',
      categories: [{ id: 1, name: 'News: Security', slug: 'security' }],
      tags: [{ id: 2, name: 'xss\nsafe', slug: 'xss' }],
    } satisfies WPPost);

    expect(frontmatter).toMatch(/^---\n/);
    expect(frontmatter).toContain('title: |');
    expect(frontmatter).toContain('- "News: Security"');
    expect(frontmatter).toMatch(/\n---\n\n$/);
  });
});

describe('generateProject', () => {
  it('generates a usable client, ContentRenderer pages, and taxonomy archives', async () => {
    const scan: ScanResult = {
      createdAt: '2026-01-01T00:00:00',
      site: {
        name: 'Example',
        description: '',
        url: 'https://wp.example.com',
        home: 'https://wp.example.com',
        postTypes: [],
        taxonomies: [],
      },
      postTypes: [
        {
          slug: 'post',
          name: 'Posts',
          restBase: 'posts',
          totalPosts: 1,
          samplePosts: [
            {
              id: 1,
              title: 'Hello',
              slug: 'hello',
              content: '<p>Hello</p>',
              excerpt: 'Hello',
              date: '2026-01-01T00:00:00',
            },
          ],
          categories: [{ id: 1, name: 'News', slug: 'news' }],
          tags: [{ id: 2, name: 'Release', slug: 'release' }],
        },
      ],
    };

    const project = await generateProject(scan, 'demo', {
      mode: 'ssr',
      dataMode: 'rest',
      template: 'blog',
    });

    const client = project.files.find((file) => file.filePath === 'lib/wp-client.ts');
    const postPage = project.files.find(
      (file) => file.filePath === 'app/posts/[slug]/page.tsx',
    );
    const categoryPage = project.files.find(
      (file) => file.filePath === 'app/category/[slug]/page.tsx',
    );
    const webhookRoute = project.files.find(
      (file) => file.filePath === 'app/api/wp-next/webhook/route.ts',
    );
    const envExample = project.files.find((file) => file.filePath === '.env.example');
    const readme = project.files.find((file) => file.filePath === 'README.md');

    expect(client?.content).toContain('createWpClient');
    expect(client?.content).not.toContain('TODO');
    expect(postPage?.content).toContain('ContentRenderer');
    expect(categoryPage?.content).toContain('category: slug');
    expect(webhookRoute?.content).toContain('WP_NEXT_WEBHOOK_SECRET');
    expect(webhookRoute?.content).toContain('x-wp-next-signature');
    expect(webhookRoute?.content).toContain('revalidatePath');
    expect(envExample?.content).toContain('WP_NEXT_WEBHOOK_SECRET=');
    expect(readme?.content).toContain('/api/wp-next/webhook');
  });
});
