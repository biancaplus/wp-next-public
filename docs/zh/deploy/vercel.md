# Vercel

Vercel 是 Next.js 项目的推荐部署平台。

## 步骤

1. 将 wp-next 生成的项目推送到 GitHub
2. 在 [vercel.com/new](https://vercel.com/new) 导入
3. 配置环境变量：
   ```
   WP_URL=https://your-wp-site.com
   REVALIDATE_SECRET=your-secret-key
   WP_NEXT_WEBHOOK_SECRET=your-webhook-secret
   ```
4. 部署

## ISR

Vercel 原生支持 ISR：

```tsx
export const revalidate = 3600; // 1 小时
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WP_URL` | 是 | WordPress 站点 URL |
| `WP_HMAC_SECRET` | HMAC 模式 | HMAC 密钥 |
| `REVALIDATE_SECRET` | Webhook | ISR 认证密钥 |
| `WP_NEXT_WEBHOOK_SECRET` | Webhook | Connector 签名密钥 |

## 自定义域名

1. Vercel 项目 → Settings → Domains
2. 添加域名并更新 DNS
