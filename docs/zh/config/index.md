# 配置概览

wp-next 通过以下方式配置：

1. **环境变量** — WordPress URL 与密钥
2. **CLI 参数** — 命令级选项
3. **`createWpClient` / `createCachedWpClient` 选项** — 运行时数据与缓存

## 当前配置方式

生成项目从环境变量和 `lib/wp-client.ts` 读取连接设置：

```ts
import { createWpClient } from '@wp-next-public/core';

export const client = createWpClient({
  baseUrl: process.env.WP_URL || 'https://your-wp-site.com',
  mode: 'rest',
});
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WP_URL` | 是 | WordPress 站点 URL |
| `WP_HMAC_SECRET` | HMAC 模式 | HMAC 共享密钥 |
| `REVALIDATE_SECRET` | Webhook | ISR revalidate 密钥 |
| `WP_NEXT_WEBHOOK_SECRET` | Webhook | WordPress Connector 签名密钥 |

## 运行时缓存

参见 [缓存](/zh/config/caching) 了解 `createCachedWpClient`。

## 路线图

`wp-next.config.ts` 与 `WPNextConfig` 类型规划中，当前 `wp-next init` 尚未生成该文件。
