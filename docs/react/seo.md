# SEO

`@wp-next-public/react` provides Next.js-first SEO utilities for WordPress content.

## generateMetadata

`createPostMeta()` generates a Next.js `Metadata` object from a `WPPost`:

```tsx
import { createPostMeta } from '@wp-next-public/react';
import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return createPostMeta({
    post,
    baseUrl: 'https://myblog.com',
    site: { name: 'My Blog' },
  });
}
```

### What It Generates

| Field | Source |
|-------|--------|
| `title` | `seoTitle` > `title` (appends site name) |
| `description` | `seoDescription` > `excerpt` |
| `canonical` | `baseUrl + postsPath + slug` |
| `openGraph` | Title, description, image, published/modified time |
| `twitter:card` | `summary_large_image` |
| `robots` | `index,follow` for published, `noindex` for others |
| `keywords` | Post tags |
| `article:*` | published_time, modified_time, author |

### Options

```ts
interface PostMetaOptions {
  post: WPPost;
  site?: WPSiteInfo;
  baseUrl?: string;
  postsPath?: string;    // default: '/posts'
  withSiteName?: boolean; // default: true
}
```

## JSON-LD

Structured data components for Google rich results.

### ArticleJsonLd

```tsx
import { ArticleJsonLd } from '@wp-next-public/react';

export default function Post({ post }) {
  return (
    <>
      <ArticleJsonLd post={post} baseUrl="https://myblog.com" />
      {/* ... rest of page ... */}
    </>
  );
}
```

Generates:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post Title",
  "description": "Post excerpt...",
  "datePublished": "2026-06-15T10:00:00",
  "author": { "@type": "Person", "name": "Tomato Pie" },
  "publisher": { "@type": "Organization", "name": "My Blog" }
}
</script>
```

### BreadcrumbJsonLd

```tsx
import { BreadcrumbJsonLd } from '@wp-next-public/react';

<BreadcrumbJsonLd items={[
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/posts' },
  { name: post.title },
]} />
```

### OrganizationJsonLd

```tsx
import { OrganizationJsonLd } from '@wp-next-public/react';

// In your root layout
<OrganizationJsonLd
  site={{ name: 'My Blog', description: 'Tech blog' }}
  baseUrl="https://myblog.com"
/>
```

## Sitemap

Generate sitemap XML for Next.js `sitemap.ts` route handlers:

```ts
// app/sitemap.ts
import { postsToSitemap, renderSitemapXml } from '@wp-next-public/react';
import { getPosts } from '@/lib/wp';

export async function GET() {
  const posts = await getPosts();
  const entries = postsToSitemap(posts, 'https://myblog.com');
  return new Response(renderSitemapXml(entries), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

### Multi-Sitemap Index

```ts
import { generateSitemapIndex } from '@wp-next-public/react';

export async function GET() {
  const index = generateSitemapIndex([
    { url: 'https://myblog.com/post-sitemap.xml' },
    { url: 'https://myblog.com/category-sitemap.xml' },
  ]);
  return new Response(index, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

## Robots.txt

```ts
// app/robots.ts
import { generateRobotsTxt } from '@wp-next-public/react';

export async function GET() {
  const robots = generateRobotsTxt('https://myblog.com', {
    disallow: ['/api/', '/admin/'],
  });
  return new Response(robots);
}
```
