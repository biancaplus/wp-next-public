# Deployment

wp-next generates standard Next.js projects — deploy anywhere Next.js runs.

## Platforms

| Platform | Setup | Best For |
|----------|-------|----------|
| [Vercel](/deploy/vercel) | Zero config | Quickest setup |
| [Self-Hosted](/deploy/self-hosted) | Docker / Node.js | Full control |
| [WordPress Webhooks](/deploy/webhooks) | HMAC + ISR | Content updates |

## Webhook for ISR

Set up a signed webhook endpoint to trigger ISR revalidation when WordPress content changes. See [WordPress Webhooks](/deploy/webhooks) for local testing, Windows PowerShell commands, ngrok setup, and WordPress connector flow.

## Performance Tips

1. **Use ISR** for detail pages — set `revalidate = 3600` for 1-hour cache
2. **Use SSG** for static pages (about, contact)
3. **Use SSR** only for personalized content
4. **CDN** — Vercel/Cloudflare cache static assets automatically
5. **Image optimization** — use Next.js `<Image>` component, enable `loading="lazy"` via `imageProcessor`
