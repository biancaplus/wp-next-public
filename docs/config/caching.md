# Caching

`createCachedWpClient` wraps the standard WordPress client with an in-memory cache.

## Usage

```ts
import { createCachedWpClient } from '@wp-next-public/core';

const wp = createCachedWpClient({
  baseUrl: process.env.WP_URL!,
  revalidate: {
    list: 300,       // list pages: 5 minutes
    detail: false,    // detail pages: no cache (wait for webhook)
    taxonomy: 600,    // category/tag pages: 10 minutes
    author: 3600,     // author pages: 1 hour
  },
  maxCacheSize: 1000, // max cache entries (default: 1000)
});
```

## Cache Methods

```ts
// Clear all cached responses
wp.clearCache();

// Invalidate cache entries matching a pattern
wp.invalidate('/posts');          // clear all post-related cache
wp.invalidate('/categories');     // clear category cache
```

## TTL Configuration

| Endpoint Type | Config Key | Recommended TTL |
|---------------|-----------|-----------------|
| Post list (`/posts`) | `list` | 300 (5 min) |
| Post detail (`/posts/slug`) | `detail` | `false` (no cache) |
| Categories (`/categories`) | `taxonomy` | 600 (10 min) |
| Tags (`/tags`) | `taxonomy` | 600 (10 min) |
| Authors (`/users`) | `author` | 3600 (1 hour) |

## Cache Eviction

When the cache reaches `maxCacheSize`, the oldest entry is evicted (FIFO). Use `invalidate()` to manually clear stale data when content changes.

## ISR Integration

Pair with Next.js ISR for optimal performance:

```ts
// app/posts/[slug]/page.tsx
export const revalidate = 3600; // ISR: 1 hour

export default async function Post({ params }) {
  const wp = createCachedWpClient({
    baseUrl: process.env.WP_URL!,
    revalidate: { detail: false }, // no client-side cache
  });

  const post = await wp.fetchPost(params.slug);
  // ...
}
```

With this setup:
- **Client cache**: off (always fetches from WP)
- **Next.js ISR**: cached for 1 hour at the edge
- **WP server**: only hit once per hour max
