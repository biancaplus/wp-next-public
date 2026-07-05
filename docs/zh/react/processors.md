# Processors

处理器在渲染前转换 HTML 字符串，每个处理器接收 HTML 并返回修改后的 HTML。

## 内置处理器

### imageProcessor

为所有 `<img>` 添加 `loading="lazy"`。

```tsx
<ContentRenderer html={post.content} processors={[imageProcessor]} />
```

### codeProcessor

根据 `<code>` 的 class 为 `<pre>` 添加 `data-language`。

### linkProcessor

为外链添加 `target="_blank"` 和 `rel="noopener noreferrer"`，内链不变。

## 自定义处理器

```tsx
import type { ContentProcessor } from '@wp-next/react';

const myProcessor: ContentProcessor = {
  name: 'my-processor',
  priority: 50,
  transformHtml(html) {
    return html.replace(/<blockquote>/g, '<blockquote class="custom-quote">');
  },
};

<ContentRenderer html={post.content} processors={[myProcessor]} />
```

## 执行顺序

按 `priority` 升序执行（数字越小越先）：

| 处理器 | Priority |
|--------|----------|
| `imageProcessor` | 10 |
| `codeProcessor` | 20 |
| `linkProcessor` | 30 |

## 零处理器模式

不传处理器等价于 `dangerouslySetInnerHTML`：

```tsx
<ContentRenderer html={post.content} />
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```
