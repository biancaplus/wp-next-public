# wp-next sync

增量同步 — 只拉取自上次同步以来变更的文章。

## 用法

```bash
wp-next sync --url <url> [options]
```

## 选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--url <url>` | WordPress 站点 URL | *（必填）* |
| `--mode <mode>` | 数据源：`rest` 或 `hmac` | `rest` |
| `--hmac-secret <secret>` | HMAC 共享密钥 | — |
| `--output <path>` | 内容输出目录 | `content` |
| `--since <iso-date>` | 从指定时间同步（ISO 8601） | *（读取状态文件）* |
| `--type <type>` | 文章类型 | `posts` |
| `--dry-run` | 预览变更，不写入 | `false` |
| `--revalidate-url <url>` | ISR revalidate 端点 | — |
| `--revalidate-secret <secret>` | 以 `x-revalidate-secret` 发送的密钥 | `REVALIDATE_SECRET` |

## 工作原理

1. 读取 `.wp-next/sync-state.json` 中的上次同步时间
2. 用 `modified_after=<last_sync>` 查询 WP API
3. 只拉取变更的文章
4. 写入/更新 `content/` 中的 MDX
5. 保存最新 `modified` 作为下次水位线
6. 可选：用 `x-revalidate-secret` 触发 Next.js ISR

## 同步状态

存储在 `.wp-next/sync-state.json`：

```json
{
  "lastSync": "2026-06-17T12:00:00.000Z",
  "postCount": 2,
  "url": "https://mysite.com"
}
```

## 示例

```bash
wp-next sync --url https://mysite.com
wp-next sync --url https://mysite.com --since "2026-06-10T00:00:00"
wp-next sync --url https://mysite.com --dry-run
wp-next sync --url https://mysite.com --revalidate-url https://myblog.com/api/revalidate --revalidate-secret "$REVALIDATE_SECRET"
```

## 自动化

可加入 cron 或 CI：

```yaml
# .github/workflows/sync.yml
name: Sync Content
on:
  schedule:
    - cron: '*/30 * * * *'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx @wp-next-public/cli sync --url ${{ secrets.WP_URL }}
```
