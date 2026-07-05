# wp-next pull

Pulls content from a WordPress site into local MDX (or JSON) files.

## Usage

```bash
wp-next pull --url <url> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url <url>` | WordPress site URL | *(required)* |
| `--mode <mode>` | Data source: `rest` or `hmac`; `graphql` is reserved for a future package | `rest` |
| `--hmac-secret <secret>` | HMAC shared secret for custom APIs | — |
| `--output <path>` | Content output directory | `content` |
| `--all` | Pull all content (default: first 10) | `false` |
| `--type <type>` | Post type to pull | `posts` |
| `--format <fmt>` | Output format: `mdx` or `json` | `mdx` |

## What It Does

1. **Connects** to the WordPress REST API
2. **Fetches** posts with pagination (up to 100 per page with `--all`)
3. **Generates** MDX files with YAML frontmatter:
   ```mdx
   ---
   title: "Hello World"
   slug: "hello-world"
   date: "2026-06-15T10:00:00"
   modified: "2026-06-15T12:00:00"
   categories:
     - Tech
   tags:
     - wordpress
     - headless
   author: "Tomato Pie"
   featuredImage: "https://example.com/img.jpg"
   ---

   <p>Your WordPress content here...</p>
   ```
4. **Downloads** same-origin featured images to `public/images/`
5. **Outputs** to `content/{type}/{slug}/index.mdx`

## Examples

```bash
# Pull first 10 posts
wp-next pull --url https://mysite.com

# Pull all posts
wp-next pull --url https://mysite.com --all

# Pull pages
wp-next pull --url https://mysite.com --type pages

# Output as JSON
wp-next pull --url https://mysite.com --format json

# Custom output directory
wp-next pull --url https://mysite.com --output ./content/blog

# HMAC authentication
wp-next pull --url https://mysite.com --mode hmac --hmac-secret "$WP_HMAC_SECRET"
```

## MDX vs JSON

| Format | Best For | Frontmatter |
|--------|----------|-------------|
| `mdx` | Content-driven sites, Next.js MDX | YAML + HTML body |
| `json` | API consumers, programmatic access | Nested JSON |
