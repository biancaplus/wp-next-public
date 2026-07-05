# 缓存

`createCachedWpClient` 在标准 WordPress 客户端外包装内存缓存。

## 用法

```ts
import { createCachedWpClient } from '@wp-next-public/core';

const wp = createCachedWpClient({
  baseUrl: process.env.WP_URL!,
  revalidate: {
    list: 300,       // 列表页：5 分钟
    detail: false,    // 详情页：不缓存（等 webhook）
    taxonomy: 600,    // 分类/标签：10 分钟
    author: 3600,     // 作者页：1 小时
  },
  maxCacheSize: 1000,
});
```

## 缓存方法

```ts
wp.clearCache();
wp.invalidate('/posts');
wp.invalidate('/categories');
```

## TTL 建议

| 端点类型 | 配置键 | 推荐 TTL |
|----------|--------|----------|
| 文章列表 | `list` | 300（5 分钟） |
| 文章详情 | `detail` | `false`（不缓存） |
| 分类/标签 | `taxonomy` | 600（10 分钟） |
| 作者 | `author` | 3600（1 小时） |

## 缓存淘汰

达到 `maxCacheSize` 时按 FIFO 淘汰最旧条目。内容变更时可用 `invalidate()` 手动清除。

## 与 ISR 配合

```ts
// app/posts/[slug]/page.tsx
export const revalidate = 3600;

export default async function Post({ params }) {
  const wp = createCachedWpClient({
    baseUrl: process.env.WP_URL!,
    revalidate: { detail: false },
  });
  const post = await wp.fetchPost(params.slug);
  // ...
}
```

- **客户端缓存**：关闭（始终请求 WP）
- **Next.js ISR**：边缘缓存 1 小时
- **WP 服务器**：每小时最多被请求一次
