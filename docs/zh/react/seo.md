# SEO

`@wp-next/react` 提供面向 Next.js 的 SEO 工具。

## generateMetadata

`createPostMeta()` 从 `WPPost` 生成 Next.js `Metadata`：

```tsx
import { createPostMeta } from '@wp-next/react';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return createPostMeta({
    post,
    baseUrl: 'https://myblog.com',
    site: { name: 'My Blog' },
  });
}
```

### 生成字段

| 字段 | 来源 |
|------|------|
| `title` | `seoTitle` > `title` |
| `description` | `seoDescription` > `excerpt` |
| `canonical` | `baseUrl + postsPath + slug` |
| `openGraph` | 标题、描述、图片、发布时间 |
| `twitter:card` | `summary_large_image` |
| `robots` | 已发布 `index,follow`，否则 `noindex` |

## JSON-LD

### ArticleJsonLd

```tsx
<ArticleJsonLd post={post} baseUrl="https://myblog.com" />
```

### BreadcrumbJsonLd

```tsx
<BreadcrumbJsonLd items={[
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/posts' },
  { name: post.title },
]} />
```

### OrganizationJsonLd

```tsx
<OrganizationJsonLd
  site={{ name: 'My Blog', description: 'Tech blog' }}
  baseUrl="https://myblog.com"
/>
```

## Sitemap

```ts
import { postsToSitemap, renderSitemapXml } from '@wp-next/react';

export async function GET() {
  const posts = await getPosts();
  const entries = postsToSitemap(posts, 'https://myblog.com');
  return new Response(renderSitemapXml(entries), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

## robots.txt

```ts
import { generateRobotsTxt } from '@wp-next/react';

export async function GET() {
  const robots = generateRobotsTxt('https://myblog.com', {
    disallow: ['/api/', '/admin/'],
  });
  return new Response(robots);
}
```
