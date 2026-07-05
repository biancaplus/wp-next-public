# Configuration Roadmap

## wp-next.config.ts

`wp-next.config.ts` is planned, but it is **not generated yet**. Today, generated projects use `WP_URL`, optional `WP_HMAC_SECRET`, CLI flags, and direct `createWpClient` / `createCachedWpClient` options.

The future configuration file is expected to look like this:

```ts
import type { WPNextConfig } from '@wp-next-public/core';

const config: WPNextConfig = {
  wpUrl: process.env.WP_URL!,
  mode: 'rest',          // 'rest' | 'hmac' initially; GraphQL is roadmap
  postsPath: '/posts',   // URL prefix for post pages
  cache: {
    list: 300,           // 5 minutes for list pages
    detail: false,       // no cache for detail (wait for webhook)
    taxonomy: 600,       // 10 minutes for category/tag pages
  },
  seo: {
    defaultTitle: 'My Blog',
    titleSeparator: '|',
  },
};

export default config;
```

## Environment Variables

```bash
# .env.local
WP_URL=https://your-wp-site.com
WP_HMAC_SECRET=your-hmac-secret  # only for HMAC mode
```
