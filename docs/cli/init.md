# wp-next init

Scans a WordPress site and generates a Next.js project with App Router.

## Usage

```bash
wp-next init --url <url> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url <url>` | WordPress site URL | *(required)* |
| `--mode <mode>` | Data source: `rest` or `hmac`; `graphql` is reserved for a future package | `rest` |
| `--hmac-secret <secret>` | HMAC shared secret for custom APIs | — |
| `--output <path>` | Output directory | `.` |
| `--template <name>` | Template: `minimal`, `blog`, `full` | `blog` |
| `--post-types <list>` | Limit post types (comma-separated) | — |
| `--ssg` | Generate SSG pages instead of SSR | `false` |

## What It Does

1. **Scans** the WordPress site via REST API (`/wp-json/wp/v2/types`, `/taxonomies`)
2. **Detects** all post types, taxonomies, and sample content
3. **Generates** a complete Next.js project:
   - `package.json` with Next.js 16 + React 19 dependencies
   - `next.config.ts` with `transpilePackages`
   - `tsconfig.json` with path aliases
   - `.env.example` with `WP_URL` and `WP_NEXT_WEBHOOK_SECRET`
   - App Router layout and page files
   - Route generators for each post type
   - `app/api/wp-next/webhook/route.ts` for signed WordPress connector events
   - Project `README.md` with local setup and webhook notes
4. **Outputs** a ready-to-run project

## Examples

```bash
# Basic usage
wp-next init --url https://mysite.com

# Blog template with SSG
wp-next init --url https://mysite.com --template blog --ssg

# Custom output directory
wp-next init --url https://mysite.com --output ./my-blog

# Limit to posts and pages only
wp-next init --url https://mysite.com --post-types "posts,pages"

# HMAC authentication (custom API)
wp-next init --url https://mysite.com --mode hmac --hmac-secret "$WP_HMAC_SECRET"
```

## Generated Project Structure

```
my-blog/
├── app/
│   ├── api/wp-next/webhook/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── posts/[slug]/page.tsx
├── lib/
│   ├── types.ts
│   └── wp-client.ts
├── .env.example
├── README.md
├── next.config.ts
├── tsconfig.json
└── package.json
```
