# 迁移指南

如何将现有 WordPress 站点迁移到 wp-next。

## 第一步：审计 WordPress 站点

迁移前先了解内容结构：

```bash
npx @wp-next-public/cli init --url https://your-wp-site.com --output /tmp/dry-run
```

将显示：

- 文章类型（posts、pages、自定义类型）
- 分类法（分类、标签、自定义）
- 文章数量

## 第二步：选择渲染策略

| 策略 | 适用场景 | wp-next 命令 |
|------|----------|--------------|
| **SSG** | 静态内容、很少变更 | `init --ssg` |
| **SSR** | 动态内容、频繁更新 | `init`（默认） |
| **ISR** | 静态与动态混合 | 手动配置 `revalidate` |

## 第三步：拉取内容

```bash
wp-next pull --url https://your-wp-site.com --all --format mdx
```

内容以带 YAML frontmatter 的 MDX 存储：

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
author: "Author"
featuredImage: "https://example.com/image.jpg"
---

<p>Your WordPress content here...</p>
```

## 第四步：配置增量同步

```bash
# 首次：拉取自上次同步以来的全部变更
wp-next sync --url https://your-wp-site.com

# 后续：只拉取新增/修改的文章
wp-next sync --url https://your-wp-site.com
```

可通过 cron 或 GitHub Action 定期执行 sync。

## 第五步：替换 WordPress 主题渲染

用 ContentRenderer 替代主题 HTML 输出：

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

## 第六步：迁移 SEO

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

## 第七步：部署

参见 [部署指南](/zh/deploy/) 了解 Vercel 与自托管方案。

## 常见问题

1. **图片缺失**：使用 `wp-next pull --all` 下载特色图片
2. **构建慢**：使用 `createCachedWpClient` 缓存 WP API 响应
3. **链接错误**：使用 `linkProcessor` 区分内外链
4. **SEO 字段缺失**：确保 WP 安装了 Yoast / RankMath / AIOSEO
