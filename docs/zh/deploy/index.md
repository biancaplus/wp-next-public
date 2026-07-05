# 部署

wp-next 生成标准 Next.js 项目 — 可在任何支持 Next.js 的平台部署。

## 平台

| 平台 | 说明 | 适用 |
|------|------|------|
| [Vercel](/zh/deploy/vercel) | 零配置 | 最快上手 |
| [自托管](/zh/deploy/self-hosted) | Docker / Node.js | 完全控制 |
| [WordPress Webhook](/zh/deploy/webhooks) | HMAC + ISR | 内容实时更新 |

## Webhook 与 ISR

配置签名 Webhook，在 WordPress 内容变更时触发 ISR revalidate。参见 [WordPress Webhook](/zh/deploy/webhooks) 了解本地测试、PowerShell 命令、ngrok 与 Connector 配置。

## 性能建议

1. 详情页使用 **ISR**，如 `revalidate = 3600`
2. 静态页面（关于、联系）使用 **SSG**
3. 仅个性化内容使用 **SSR**
4. 静态资源走 CDN
5. 通过 `imageProcessor` 启用图片 lazy loading
