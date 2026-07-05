# 配置路线图

## wp-next.config.ts

`wp-next.config.ts` 已在规划中，**当前尚未生成**。现阶段使用 `WP_URL`、可选 `WP_HMAC_SECRET`、CLI 参数及 `createWpClient` / `createCachedWpClient` 选项。

未来配置文件预期形态：

```ts
import type { WPNextConfig } from '@wp-next/core';

const config: WPNextConfig = {
  wpUrl: process.env.WP_URL!,
  mode: 'rest',
  postsPath: '/posts',
  cache: {
    list: 300,
    detail: false,
    taxonomy: 600,
  },
  seo: {
    defaultTitle: 'My Blog',
    titleSeparator: '|',
  },
};

export default config;
```

## 环境变量

```bash
# .env.local
WP_URL=https://your-wp-site.com
WP_HMAC_SECRET=your-hmac-secret  # 仅 HMAC 模式
WP_NEXT_WEBHOOK_SECRET=change-me
```
