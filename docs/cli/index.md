# CLI Reference

`wp-next` provides three commands: `init`, `pull`, and `sync`.

## Overview

```bash
wp-next <command> [options]

Commands:
  init        Scan a WordPress site and generate a Next.js project
  pull        Pull content from a WordPress site
  sync        Incremental sync — only pull changed posts since last sync
```

## Common Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url <url>` | WordPress site URL | *(required)* |
| `--mode <mode>` | Data source: `rest` or `hmac`; `graphql` currently exits with a clear not-implemented error | `rest` |
| `--hmac-secret <secret>` | HMAC shared secret for `--mode hmac` | — |
| `--output <path>` | Output directory | `content` |
| `--type <type>` | Post type | `posts` |
