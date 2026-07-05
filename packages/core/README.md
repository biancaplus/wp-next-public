# @wp-next/core

WordPress 数据获取、类型定义与缓存工具。

## 安装

```bash
npm install @wp-next/core
```

## 使用

```ts
import { createWpClient, scanWpSite } from '@wp-next/core';

const wp = createWpClient({ baseUrl: 'https://your-wp-site.com' });

// 文章列表（支持分页）
const { data: posts, totalPages } = await wp.fetchPosts({ perPage: 20 });

// 单篇文章
const post = await wp.fetchPost('hello-world');

// 分类 / 标签
const categories = await wp.fetchCategories();

// 扫描站点结构（post types、taxonomies）
const scan = await scanWpSite('https://your-wp-site.com');
```

### 带缓存的客户端

```ts
import { createCachedWpClient } from '@wp-next/core';

const wp = createCachedWpClient({
  baseUrl: process.env.WP_URL!,
  revalidate: { list: 300, detail: false, taxonomy: 600 },
});
```

## 主要导出

- `createWpClient` / `createCachedWpClient` — REST / HMAC 数据客户端
- `scanWpSite` — 站点结构扫描
- `createPostMeta`、`extractSeoFields` — SEO 字段提取
- 类型：`WPPost`、`WPPage`、`WPTerm` 等

完整 API 见 [文档](https://github.com/biancaplus/wp-next/tree/main/docs)。
