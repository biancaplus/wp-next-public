# wp-next — WordPress Headless 现代化工具链

> 让 WordPress 站点**零门槛迁移到 Next.js**，同时保持 WP 后台管理体验。  
> 对标 `create-next-app`：输入 WP 站点，输出 Next.js 项目。

---

## 快速开始

```bash
npx @wp-next/cli init --url=https://your-wp-site.com --output ./my-blog
cd my-blog
npm install
npm run dev
```

生成项目包含：文章/页面/分类/标签路由、WP 客户端、`/api/wp-next/webhook` 接收器、`.env.example`。

### 环境要求

- Node.js 20.9+
- WordPress 站点开启 REST API（`/wp-json/wp/v2/`）

---

## 核心命令

| 命令 | 作用 |
|------|------|
| `wp-next init` | 扫描 WP 站点结构，生成 Next.js 项目骨架 |
| `wp-next pull` | 拉取文章/页面等内容，生成 MDX 文件 |
| `wp-next sync` | 增量同步（`modified_after`）+ 可选 ISR revalidate |

```bash
# 增量同步示例
wp-next sync --url=https://your-wp-site.com --revalidate-url=http://localhost:3000/api/wp-next/webhook
```

查看完整 CLI 参数：`npx @wp-next/cli --help`

---

## npm 包

| 包 | 说明 | 文档 |
|----|------|------|
| [`@wp-next/cli`](./packages/cli/) | 命令行工具（`wp-next`） | [README](./packages/cli/README.md) · [文档](https://biancaplus.github.io/wp-next-public/cli/) · [npm](https://www.npmjs.com/package/@wp-next/cli) |
| [`@wp-next/core`](./packages/core/) | WP REST/HMAC 客户端、类型、缓存 | [README](./packages/core/README.md) · [文档](https://biancaplus.github.io/wp-next-public/config/) · [npm](https://www.npmjs.com/package/@wp-next/core) |
| [`@wp-next/react`](./packages/react/) | `ContentRenderer` + SEO 工具 | [README](./packages/react/README.md) · [文档](https://biancaplus.github.io/wp-next-public/react/) · [npm](https://www.npmjs.com/package/@wp-next/react) |

### ContentRenderer 示例

```tsx
import { ContentRenderer, imageProcessor, codeProcessor, linkProcessor } from '@wp-next/react';

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <ContentRenderer
        html={post.content}
        processors={[imageProcessor, codeProcessor, linkProcessor]}
      />
    </article>
  );
}
```

---

## 数据接入

| 方式 | 命令 |
|------|------|
| WP REST API | `wp-next init --url=https://my-wp.com` |
| HMAC 自定义 API | `wp-next init --url=... --mode=hmac --hmac-secret=xxx` |

---

## WordPress 实时更新

配合独立插件 **wp-next-connector**：

1. WP 后台配置 Webhook URL 和 Secret
2. 文章发布/更新/删除时发送 HMAC 签名请求
3. Next.js `/api/wp-next/webhook` 验证签名并 `revalidatePath`

生成项目的 webhook 说明见 CLI 模板输出的 `README.md` 与 `.env.example`。

---

## 仓库结构

```
wp-next-public/
├── packages/
│   ├── core/          # @wp-next/core
│   ├── react/         # @wp-next/react
│   └── cli/           # @wp-next/cli（含 init 模板）
├── docs/              # VitePress 用户文档
├── scripts/           # lint / test / build 脚本
├── .changeset/        # 版本与发布配置
└── .github/workflows/ # CI + GitHub Pages
```

**在线文档**（中 / En）：https://biancaplus.github.io/wp-next-public/

- 英文默认：`/guide/`
- 中文：`/zh/guide/`

---

## 本地开发

```bash
git clone git@github.com:biancaplus/wp-next-public.git
cd wp-next-public
corepack enable
corepack prepare pnpm@11.7.0 --activate
corepack pnpm install
corepack pnpm lint && corepack pnpm test && corepack pnpm build

# 本地预览文档
corepack pnpm docs:dev
```

---

## 发布

```bash
npm login
corepack pnpm release
```

### GitHub Pages 文档站

推送 `main` 后，`.github/workflows/docs.yml` 会自动构建并部署文档。

**首次启用**（GitHub 仓库 Settings → Pages）：

1. **Build and deployment** → Source 选 **GitHub Actions**
2. 等待 `Deploy Docs` workflow 跑完
3. 访问 https://biancaplus.github.io/wp-next-public/

本地预览：`corepack pnpm docs:dev`（开发服务器路径含 `/wp-next-public/` 前缀）

---

## License

MIT
