# ContentRenderer

Renders WordPress HTML content with an optional processor pipeline.

## Basic Usage

```tsx
import { ContentRenderer } from '@wp-next-public/react';

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <ContentRenderer html={post.content} />
    </article>
  );
}
```

Without processors, ContentRenderer behaves exactly like `dangerouslySetInnerHTML` — zero breaking changes.

## With Processors

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `html` | `string` | *(required)* | Raw HTML from WordPress |
| `processors` | `ContentProcessor[]` | `[]` | Optional processor pipeline |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | Wrapper element tag |
| `className` | `string` | — | Additional CSS class |

## How It Works

1. **Sanitize** — HTML is cleaned with DOMPurify (removes XSS)
2. **Process** — Each processor's `transformHtml()` is called in priority order
3. **Render** — Final HTML rendered via `dangerouslySetInnerHTML`

## Custom Wrapper

```tsx
<ContentRenderer html={post.content} as="section" className="prose" />
```

Renders as `<section class="prose" dangerouslySetInnerHTML={...} />`.
