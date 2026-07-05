# WordPress Webhooks

Use the generated project webhook receiver to accept signed WordPress content events and trigger on-demand revalidation.

## Endpoint

Generated projects listen at:

```text
POST /api/wp-next/webhook
```

It requires `WP_NEXT_WEBHOOK_SECRET` and an `X-WP-Next-Signature` header formatted as `sha256=<hex>`, where `<hex>` is an HMAC-SHA256 digest of the raw JSON request body.

Supported events are:

```text
test
post_published
post_updated
post_deleted
page_published
page_updated
page_deleted
```

Post events revalidate `/posts` and, when `slug` is present, `/posts/<slug>`. Page events revalidate `/` and, when `slug` is present, `/<slug>`.

## Local Test

Create a local secret in your generated project:

```bash
cd my-blog
cp .env.example .env.local
```

Set `WP_NEXT_WEBHOOK_SECRET` in `.env.local`, then start the app:

```bash
corepack pnpm dev
```

In another shell, generate a signed test event:

```bash
BODY='{"event":"test"}'
SECRET='change-me'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')

curl -i http://localhost:3100/api/wp-next/webhook \
  -H "Content-Type: application/json" \
  -H "X-WP-Next-Signature: sha256=$SIG" \
  --data "$BODY"
```

A successful response is:

```json
{"ok":true,"event":"test"}
```

## Windows PowerShell

PowerShell can compute the same signature without OpenSSL:

```powershell
$Body = '{"event":"test"}'
$Secret = 'change-me'
$Key = [Text.Encoding]::UTF8.GetBytes($Secret)
$Bytes = [Text.Encoding]::UTF8.GetBytes($Body)
$Hmac = [Security.Cryptography.HMACSHA256]::new($Key)
$Sig = -join ($Hmac.ComputeHash($Bytes) | ForEach-Object { $_.ToString('x2') })

Invoke-WebRequest `
  -Uri http://localhost:3100/api/wp-next/webhook `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{ 'X-WP-Next-Signature' = "sha256=$Sig" } `
  -Body $Body
```

## ngrok

Expose the local demo for a WordPress site that cannot reach `localhost`:

```bash
ngrok http 3100
```

Use the HTTPS forwarding URL as the WordPress webhook target:

```text
https://<your-ngrok-host>/api/wp-next/webhook
```

Keep the same `WP_NEXT_WEBHOOK_SECRET` value in the Next.js app `.env.local` and in the WordPress connector settings.

## WordPress Connector Flow

1. Install and activate the `wp-next-connector` plugin in WordPress.
2. Set the webhook URL to your local ngrok URL or deployed Next.js URL.
3. Set the shared secret to the same value as `WP_NEXT_WEBHOOK_SECRET`.
4. Send the connector test event and expect `{ "ok": true, "event": "test" }`.
5. Publish, update, or delete a post/page and verify the response includes the revalidated paths.
