# @wp-next/react

WordPress HTML 内容渲染 + 可插拔处理器管线 + SEO 工具。

## 安装

```bash
npm install @wp-next/react
```

Peer dependencies：`react`、`react-dom`、`next`（^14 / ^15 / ^16）。

## ContentRenderer

```tsx
import {
  ContentRenderer,
  imageProcessor,
  codeProcessor,
  linkProcessor,
} from '@wp-next/react';

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <ContentRenderer
        html={post.content}
        processors={[imageProcessor, codeProcessor, linkProcessor]}
      />
    </article>
  );
}
```

不注册处理器时，行为与 `dangerouslySetInnerHTML` 一致；HTML 经 `isomorphic-dompurify` 净化。

## 自定义处理器

```ts
import type { ContentProcessor } from '@wp-next/react';

const galleryProcessor: ContentProcessor = {
  name: 'gallery',
  test: (el) => el.classList.contains('wp-block-gallery'),
  process: (el) => /* 返回 React 节点 */,
};
```

## SEO 工具

```tsx
import { createPostMeta, ArticleJsonLd, renderSitemapXml } from '@wp-next/react';
```

完整用法见 [文档](https://github.com/biancaplus/wp-next/tree/main/docs/react/)。
