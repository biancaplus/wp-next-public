# WordPress Webhook

生成项目内置 Webhook 接收器，验证签名并触发按需 revalidate。

## 端点

```text
POST /api/wp-next/webhook
```

需要 `WP_NEXT_WEBHOOK_SECRET` 和 `X-WP-Next-Signature: sha256=<hex>` 请求头，其中 hex 为原始 JSON body 的 HMAC-SHA256 摘要。

支持事件：

```text
test
post_published / post_updated / post_deleted
page_published / page_updated / page_deleted
```

文章事件 revalidate `/posts` 及 `/posts/<slug>`；页面事件 revalidate `/` 及 `/<slug>`。

## 本地测试

```bash
cd my-blog
cp .env.example .env.local
# 编辑 .env.local 设置 WP_NEXT_WEBHOOK_SECRET
npm run dev
```

另开终端发送签名请求：

```bash
BODY='{"event":"test"}'
SECRET='change-me'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')

curl -i http://localhost:3000/api/wp-next/webhook \
  -H "Content-Type: application/json" \
  -H "X-WP-Next-Signature: sha256=$SIG" \
  --data "$BODY"
```

成功响应：`{"ok":true,"event":"test"}`

## Windows PowerShell

```powershell
$Body = '{"event":"test"}'
$Secret = 'change-me'
$Key = [Text.Encoding]::UTF8.GetBytes($Secret)
$Bytes = [Text.Encoding]::UTF8.GetBytes($Body)
$Hmac = [Security.Cryptography.HMACSHA256]::new($Key)
$Sig = -join ($Hmac.ComputeHash($Bytes) | ForEach-Object { $_.ToString('x2') })

Invoke-WebRequest `
  -Uri http://localhost:3000/api/wp-next/webhook `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{ 'X-WP-Next-Signature' = "sha256=$Sig" } `
  -Body $Body
```

## ngrok

WordPress 无法访问 localhost 时：

```bash
ngrok http 3000
```

Webhook URL：`https://<ngrok-host>/api/wp-next/webhook`

Next.js 与 WordPress Connector 使用相同的 `WP_NEXT_WEBHOOK_SECRET`。

## WordPress Connector 流程

1. 安装并启用 `wp-next-connector` 插件
2. 配置 Webhook URL（ngrok 或生产地址）
3. 配置与 Next.js 相同的 Secret
4. 发送测试事件，期望 `{ "ok": true, "event": "test" }`
5. 发布/更新/删除文章，确认响应包含 revalidated 路径
