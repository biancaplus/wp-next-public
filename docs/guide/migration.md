# Migration Guide

How to migrate an existing WordPress site to wp-next.

## Step 1: Audit Your WordPress Site

Before migrating, understand your content structure:

```bash
npx @wp-next-public/cli init --url https://your-wp-site.com --output /tmp/dry-run
```

This shows:
- Post types (posts, pages, custom types)
- Taxonomies (categories, tags, custom)
- Post counts

## Step 2: Choose Your Render Strategy

| Strategy | Best For | wp-next Command |
|----------|----------|-----------------|
| **SSG** | Static content, rarely changes | `init --ssg` |
| **SSR** | Dynamic content, frequent updates | `init` (default) |
| **ISR** | Mix of static + dynamic | Manual setup with `revalidate` |

## Step 3: Pull Content

```bash
wp-next pull --url https://your-wp-site.com --all --format mdx
```

Content is stored as MDX files with YAML frontmatter:

```mdx
---
title: "My Post"
slug: "my-post"
date: "2026-06-15T10:00:00"
modified: "2026-06-15T12:00:00"
categories:
  - Tech
tags:
  - wordpress
  - headless
author: "Tomato Pie"
featuredImage: "https://example.com/image.jpg"
---

<p>Your WordPress content here...</p>
```

## Step 4: Set Up Incremental Sync

```bash
# First run: pulls all changes since last sync
wp-next sync --url https://your-wp-site.com

# Subsequent runs: only pulls new/modified posts
wp-next sync --url https://your-wp-site.com
```

Add a cron job or GitHub Action to run sync periodically.

## Step 5: Replace WordPress Themes

Replace your WP theme's rendering with ContentRenderer:

```tsx
import { ContentRenderer, imageProcessor, linkProcessor } from '@wp-next-public/react';

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <ContentRenderer
        html={post.content}
        processors={[imageProcessor, linkProcessor]}
      />
    </article>
  );
}
```

## Step 6: Migrate SEO

```tsx
import { createPostMeta, ArticleJsonLd } from '@wp-next-public/react';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return createPostMeta({ post, baseUrl: 'https://mynewblog.com' });
}

export default function Post({ post }) {
  return (
    <>
      <ArticleJsonLd post={post} baseUrl="https://mynewblog.com" />
      <h1>{post.title}</h1>
      <ContentRenderer html={post.content} />
    </>
  );
}
```

## Step 7: Deploy

See [Deployment Guide](/deploy/) for Vercel and self-hosted options.

## Common Pitfalls

1. **Missing images**: Run `wp-next pull` with `--all` to download featured images
2. **Slow builds**: Use `createCachedWpClient` for caching WP API responses
3. **Broken links**: Use `linkProcessor` to handle internal vs external links
4. **SEO fields missing**: Ensure your WP site has Yoast/RankMath/AIOSEO installed
