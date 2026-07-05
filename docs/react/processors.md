# Processors

Processors transform the HTML string before rendering. Each processor is a function that receives HTML and returns modified HTML.

## Built-in Processors

### imageProcessor

Adds `loading="lazy"` to all `<img>` tags.

```tsx
import { imageProcessor } from '@wp-next-public/react';

<ContentRenderer html={post.content} processors={[imageProcessor]} />
```

**Before**:
```html
<img src="photo.jpg" alt="A photo" />
```

**After**:
```html
<img src="photo.jpg" alt="A photo" loading="lazy" />
```

### codeProcessor

Adds `data-language` attribute to `<pre>` tags based on their `<code>` element's class.

```tsx
import { codeProcessor } from '@wp-next-public/react';

<ContentRenderer html={post.content} processors={[codeProcessor]} />
```

**Before**:
```html
<pre class="wp-block-code"><code class="language-javascript">console.log('hi')</code></pre>
```

**After**:
```html
<pre data-language="javascript"><code class="language-javascript">console.log('hi')</code></pre>
```

### linkProcessor

Adds `target="_blank"` and `rel="noopener noreferrer"` to external links. Internal links are left unchanged.

```tsx
import { linkProcessor } from '@wp-next-public/react';

<ContentRenderer html={post.content} processors={[linkProcessor]} />
```

**Before**:
```html
<a href="https://nextjs.org">External</a>
<a href="/blog/about">Internal</a>
```

**After**:
```html
<a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">External</a>
<a href="/blog/about">Internal</a>
```

## Custom Processors

```tsx
import type { ContentProcessor } from '@wp-next-public/react';

const myProcessor: ContentProcessor = {
  name: 'my-processor',
  priority: 50,  // lower = runs first
  transformHtml(html) {
    // Modify the HTML string
    return html.replace(
      /<blockquote>/g,
      '<blockquote class="custom-quote">'
    );
  },
};

<ContentRenderer html={post.content} processors={[myProcessor]} />
```

## Ordering

Processors run in priority order (lowest first). Default priorities:

| Processor | Priority |
|-----------|----------|
| `imageProcessor` | 10 |
| `codeProcessor` | 20 |
| `linkProcessor` | 30 |

## Zero-Processor Mode

Passing no processors (or empty array) is equivalent to `dangerouslySetInnerHTML`:

```tsx
// These are equivalent:
<ContentRenderer html={post.content} />
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```
