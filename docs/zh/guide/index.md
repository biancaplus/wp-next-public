# 快速开始

wp-next 是一套将 WordPress 站点迁移到 Next.js 的工具链，提供 CLI 内容拉取、React 渲染组件，以及 SEO 与缓存工具。

## 前置条件

- **Node.js** ≥ 20.9
- 已开启 REST API 的 **WordPress 站点**（WP 4.7 起默认支持）

## 快速上手

### 1. 生成 Next.js 项目

```bash
npx @wp-next-public/cli init --url https://your-wp-site.com --output ./my-blog
cd my-blog
npm install
npm run dev
```

将生成 App Router 项目，包含路由、WP 客户端、Webhook 接收器与 `.env.example`。

### 2. 拉取内容（可选）

若希望使用 MDX 文件而非实时 API：

```bash
npx @wp-next-public/cli pull --url https://your-wp-site.com --all --output ./my-blog/content
```

### 3. 增量同步（可选）

```bash
npx @wp-next-public/cli sync --url https://your-wp-site.com
```

访问 `http://localhost:3000`，WordPress 内容已在 Next.js 中呈现。

---

## 下一步

- [CLI 参考](/zh/cli/) — 全部命令与参数
- [React 组件](/zh/react/) — ContentRenderer、Processors、SEO
- [配置](/zh/config/) — 环境变量与缓存
- [部署](/zh/deploy/) — Vercel、自托管、Webhook

## 架构

```
@wp-next-public/cli        @wp-next-public/react         @wp-next-public/core
     │                    │                      │
 wp-next init       ContentRenderer          createWpClient
 wp-next pull       imageProcessor            scanWpSite
 wp-next sync       linkProcessor            createCachedWpClient
                    codeProcessor
                    createPostMeta
                    ArticleJsonLd
```

从 npm 安装：`@wp-next-public/cli`、`@wp-next-public/react`、`@wp-next-public/core`。

## 参与贡献

源码与文档：[wp-next-public](https://github.com/biancaplus/wp-next-public)

```bash
git clone https://github.com/biancaplus/wp-next-public.git
cd wp-next-public
corepack enable && corepack prepare pnpm@11.7.0 --activate
pnpm install && pnpm build
```
