# wp-next init

扫描 WordPress 站点，生成带 App Router 的 Next.js 项目。

## 用法

```bash
wp-next init --url <url> [options]
```

## 选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--url <url>` | WordPress 站点 URL | *（必填）* |
| `--mode <mode>` | 数据源：`rest` 或 `hmac` | `rest` |
| `--hmac-secret <secret>` | 自定义 API 的 HMAC 密钥 | — |
| `--output <path>` | 输出目录 | `.` |
| `--template <name>` | 模板：`minimal`、`blog`、`full` | `blog` |
| `--post-types <list>` | 限制文章类型（逗号分隔） | — |
| `--ssg` | 生成 SSG 页面而非 SSR | `false` |

## 执行流程

1. **扫描** WordPress REST API（`/wp-json/wp/v2/types`、`/taxonomies`）
2. **检测** 所有文章类型、分类法与示例内容
3. **生成** 完整 Next.js 项目：
   - `package.json`（Next.js 16 + React 19）
   - `next.config.ts`（含 `transpilePackages`）
   - `tsconfig.json`（路径别名）
   - `.env.example`（`WP_URL`、`WP_NEXT_WEBHOOK_SECRET`）
   - App Router 布局与页面
   - 各文章类型的路由
   - `app/api/wp-next/webhook/route.ts`（签名 Webhook）
   - 项目 `README.md`（本地配置与 Webhook 说明）
4. **输出** 可直接运行的项目

## 示例

```bash
wp-next init --url https://mysite.com
wp-next init --url https://mysite.com --template blog --ssg
wp-next init --url https://mysite.com --output ./my-blog
wp-next init --url https://mysite.com --post-types "posts,pages"
wp-next init --url https://mysite.com --mode hmac --hmac-secret "$WP_HMAC_SECRET"
```

## 生成项目结构

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
