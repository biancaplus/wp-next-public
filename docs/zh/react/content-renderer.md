# ContentRenderer

渲染 WordPress HTML，支持可选处理器管线。

## 基础用法

```tsx
import { ContentRenderer } from '@wp-next/react';

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <ContentRenderer html={post.content} />
    </article>
  );
}
```

不注册处理器时，行为与 `dangerouslySetInnerHTML` 完全一致。

## 使用处理器

```tsx
import { ContentRenderer, imageProcessor, linkProcessor } from '@wp-next/react';

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

## Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `html` | `string` | *（必填）* | WordPress 原始 HTML |
| `processors` | `ContentProcessor[]` | `[]` | 可选处理器管线 |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | 包装元素标签 |
| `className` | `string` | — | 额外 CSS 类 |

## 工作流程

1. **净化** — 使用 isomorphic-dompurify 清理 XSS
2. **处理** — 按优先级依次调用各处理器的 `transformHtml()`
3. **渲染** — 通过 `dangerouslySetInnerHTML` 输出

## 自定义包装元素

```tsx
<ContentRenderer html={post.content} as="section" className="prose" />
```
