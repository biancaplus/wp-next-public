# Getting Started

wp-next is a toolkit for migrating WordPress sites to Next.js. It provides a CLI for content extraction, React components for rendering, and utilities for SEO and caching.

## Prerequisites

- **Node.js** ≥ 20.9
- A **WordPress site** with REST API enabled (default since WP 4.7)

## Quick Start

### 1. Generate a Next.js project

```bash
npx @wp-next/cli init --url https://your-wp-site.com --output ./my-blog
cd my-blog
npm install
npm run dev
```

This creates a Next.js App Router project with routes, a WP client, webhook receiver, and `.env.example`.

### 2. Pull content (optional)

If you want MDX files instead of live API fetching:

```bash
npx @wp-next/cli pull --url https://your-wp-site.com --all --output ./my-blog/content
```

### 3. Incremental sync (optional)

```bash
npx @wp-next/cli sync --url https://your-wp-site.com
```

Visit `http://localhost:3000` — your WordPress content is now a Next.js site.

---

## What's Next?

- [CLI Reference](/cli/) — all commands and options
- [React Components](/react/) — ContentRenderer, processors, SEO
- [Configuration](/config/) — environment variables, caching
- [Deployment](/deploy/) — Vercel, self-hosted, webhooks

## Architecture

```
@wp-next/cli        @wp-next/react         @wp-next/core
     │                    │                      │
 wp-next init       ContentRenderer          createWpClient
 wp-next pull       imageProcessor            scanWpSite
 wp-next sync       linkProcessor            createCachedWpClient
                    codeProcessor
                    createPostMeta
                    ArticleJsonLd
```

Install from npm: `@wp-next/cli`, `@wp-next/react`, `@wp-next/core`.

## Contribute

Source code and docs live in [wp-next-public](https://github.com/biancaplus/wp-next-public).

```bash
git clone https://github.com/biancaplus/wp-next-public.git
cd wp-next-public
corepack enable && corepack prepare pnpm@11.7.0 --activate
pnpm install && pnpm build
```
