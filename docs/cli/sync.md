# wp-next sync

Incremental sync — only pull posts changed since last sync.

## Usage

```bash
wp-next sync --url <url> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url <url>` | WordPress site URL | *(required)* |
| `--mode <mode>` | Data source: `rest` or `hmac`; `graphql` is reserved for a future package | `rest` |
| `--hmac-secret <secret>` | HMAC shared secret for custom APIs | — |
| `--output <path>` | Content output directory | `content` |
| `--since <iso-date>` | Sync from this date (ISO 8601) | *(from stored state)* |
| `--type <type>` | Post type to sync | `posts` |
| `--dry-run` | Preview changes without writing | `false` |
| `--revalidate-url <url>` | ISR revalidation endpoint | — |
| `--revalidate-secret <secret>` | Secret sent as `x-revalidate-secret` | `REVALIDATE_SECRET` |

## How It Works

1. **Reads** `.wp-next/sync-state.json` for last sync timestamp
2. **Queries** WP API with `modified_after=<last_sync>` filter
3. **Only fetches** posts modified since last sync
4. **Writes/updates** MDX files in `content/`
5. **Saves** the newest synced `modified` timestamp as the next watermark
6. **Optionally** triggers Next.js ISR revalidation with `x-revalidate-secret`

## Sync State

The sync state is stored in `.wp-next/sync-state.json`:

```json
{
  "lastSync": "2026-06-17T12:00:00.000Z",
  "postCount": 2,
  "url": "https://mysite.com"
}
```

## Examples

```bash
# First sync (pulls all posts)
wp-next sync --url https://mysite.com

# Second sync (only pulls new/modified posts)
wp-next sync --url https://mysite.com
# Output: "No changes detected."

# Sync from specific date
wp-next sync --url https://mysite.com --since "2026-06-10T00:00:00"

# Dry run (preview only)
wp-next sync --url https://mysite.com --dry-run

# With ISR revalidation
wp-next sync --url https://mysite.com --revalidate-url https://myblog.com/api/revalidate --revalidate-secret "$REVALIDATE_SECRET"
```

## Automation

Add to cron or CI:

```yaml
# .github/workflows/sync.yml
name: Sync Content
on:
  schedule:
    - cron: '*/30 * * * *'  # every 30 minutes
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: npx @wp-next/cli sync --url ${{ secrets.WP_URL }}
```
