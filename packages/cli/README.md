# @wp-next/cli

从 WordPress 站点一键生成 Next.js 项目。

## 快速开始

```bash
npx @wp-next/cli init --url=https://your-wp-site.com --output ./my-blog
```

## 命令

| 命令 | 用途 |
|------|------|
| `wp-next init` | 扫描 WP 站点，生成 Next.js 项目骨架 |
| `wp-next pull` | 拉取 WP 内容生成 MDX 文件 |
| `wp-next sync` | 增量同步 + 可选 webhook revalidate |

## init 参数

```
--url <url>         WP 站点地址（必填）
--mode <mode>       数据源：rest | hmac（graphql 暂未实现）
--hmac-secret <s>   HMAC 模式密钥
--output <path>     输出目录（默认当前目录）
--template <name>   预设模板：minimal | blog | full
```

## 示例

```bash
# 基础博客
wp-next init --url=https://your-wp-site.com --output ./my-blog

# HMAC 模式
wp-next init --url=https://your-wp-site.com --mode=hmac --hmac-secret="$WP_HMAC_SECRET"

# 增量同步
wp-next sync --url=https://your-wp-site.com --dry-run
```

生成项目包含 webhook 路由、`.env.example` 和 README 配置说明。

完整参考见 [文档](https://github.com/biancaplus/wp-next/tree/main/docs/cli/)。
