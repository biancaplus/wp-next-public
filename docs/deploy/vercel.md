# Vercel

Vercel is the recommended platform for Next.js projects.

## Setup

1. Push your wp-next project to GitHub
2. Import in Vercel: [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   ```
   WP_URL=https://your-wp-site.com
   REVALIDATE_SECRET=your-secret-key
   ```
4. Deploy

## ISR Configuration

Vercel supports ISR out of the box. Add to your page component:

```tsx
export const revalidate = 3600; // 1 hour
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WP_URL` | Yes | WordPress site URL |
| `WP_HMAC_SECRET` | For HMAC | HMAC shared secret |
| `REVALIDATE_SECRET` | For webhooks | Webhook authentication secret |

## Custom Domain

1. Go to your project in Vercel dashboard
2. Settings → Domains
3. Add your domain
4. Update DNS records
