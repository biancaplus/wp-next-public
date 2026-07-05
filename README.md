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

---

## npm 包

| 包 | 说明 |
|----|------|
| [`@wp-next/cli`](./packages/cli/) | 命令行工具（`wp-next`） |
| [`@wp-next/core`](./packages/core/) | WP REST/HMAC 客户端、类型、站点扫描、缓存 |
| [`@wp-next/react`](./packages/react/) | `ContentRenderer` HTML 渲染 + SEO 工具 |

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

路线图：WPGraphQL、自定义 JSON schema、离线主题分析。

---

## WordPress 实时更新

配合独立插件 **wp-next-connector**（独立仓库）：

1. WP 后台配置 Webhook URL 和 Secret
2. 文章发布/更新/删除时发送 HMAC 签名请求
3. Next.js `/api/wp-next/webhook` 验证签名并 `revalidatePath`

---

## 仓库结构

```
wp-next/
├── packages/          # npm 发布的工具链（core / react / cli）
├── docs/              # VitePress 用户文档
├── next-demo/         # 本地示例（mock 模式，不发布）
├── dev-docs/          # 开发者文档（不发布）
└── PLAN.md            # 里程碑与发布计划
```

---

## 本地开发

```bash
git clone git@github.com:biancaplus/wp-next-public.git
cd wp-next-public
corepack enable
corepack prepare pnpm@11.7.0 --activate
corepack pnpm install
corepack pnpm build
```

本仓库为 **npm 发布用公开 monorepo**，仅包含 `@wp-next/core`、`@wp-next/react`、`@wp-next/cli` 三个包。完整示例（`next-demo`）、用户文档（`docs/`）和开发者文档（`dev-docs/`）在私有开发仓库中维护。

---

## 路线图

| 阶段 | 内容 | 状态 |
|------|------|------|
| M1 | CLI init + pull | ✅ |
| M2 | React ContentRenderer + next-demo | ✅ |
| M3 | sync + SEO + 缓存 | ✅ |
| M4 | 文档站 + Connector 联调 + CI | ✅ |
| M4+ | npm 发布、create 脚手架、Playground | 🚧 |

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/](https://github.com/biancaplus/wp-next/tree/main/docs) | 用户文档（CLI、React、部署、Webhook） |
| [dev-docs/](./dev-docs/) | 架构设计、编码规范 |
| [PLAN.md](./PLAN.md) | 里程碑与 npm 发布清单 |

---

## License

MIT
