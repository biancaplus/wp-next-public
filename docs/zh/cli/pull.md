# wp-next pull

从 WordPress 拉取内容，生成本地 MDX（或 JSON）文件。

## 用法

```bash
wp-next pull --url <url> [options]
```

## 选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--url <url>` | WordPress 站点 URL | *（必填）* |
| `--mode <mode>` | 数据源：`rest` 或 `hmac` | `rest` |
| `--hmac-secret <secret>` | HMAC 共享密钥 | — |
| `--output <path>` | 内容输出目录 | `content` |
| `--all` | 拉取全部（默认前 10 篇） | `false` |
| `--type <type>` | 文章类型 | `posts` |
| `--format <fmt>` | 输出格式：`mdx` 或 `json` | `mdx` |

## 执行流程

1. 连接 WordPress REST API
2. 分页拉取文章（`--all` 时每页最多 100 篇）
3. 生成带 YAML frontmatter 的 MDX
4. 下载同源特色图片到 `public/images/`
5. 输出到 `content/{type}/{slug}/index.mdx`

## 示例

```bash
wp-next pull --url https://mysite.com
wp-next pull --url https://mysite.com --all
wp-next pull --url https://mysite.com --type pages
wp-next pull --url https://mysite.com --format json
wp-next pull --url https://mysite.com --output ./content/blog
wp-next pull --url https://mysite.com --mode hmac --hmac-secret "$WP_HMAC_SECRET"
```

## MDX vs JSON

| 格式 | 适用场景 | 结构 |
|------|----------|------|
| `mdx` | 内容驱动站点、Next.js MDX | YAML + HTML 正文 |
| `json` | API 消费、程序化访问 | 嵌套 JSON |
