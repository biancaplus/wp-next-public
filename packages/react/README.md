# @wp-next-public/react

WordPress HTML 内容渲染 + 可插拔处理器管线 + SEO 工具。

## 安装

```bash
npm install @wp-next-public/react
```

Peer dependencies：`react`、`react-dom`、`next`（^14 / ^15 / ^16）。

## ContentRenderer

```tsx
import {
  ContentRenderer,
  imageProcessor,
  codeProcessor,
  linkProcessor,
} from '@wp-next-public/react';

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
import type { ContentProcessor } from '@wp-next-public/react';

const galleryProcessor: ContentProcessor = {
  name: 'gallery',
  test: (el) => el.classList.contains('wp-block-gallery'),
  process: (el) => /* 返回 React 节点 */,
};
```

## SEO 工具

```tsx
import { createPostMeta, ArticleJsonLd, renderSitemapXml } from '@wp-next-public/react';
```

更多说明见 [在线文档](https://biancaplus.github.io/wp-next-public/react/) 与 [npm @wp-next-public/react](https://www.npmjs.com/package/@wp-next-public/react)。
