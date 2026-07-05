# CLI 参考

`wp-next` 提供三个命令：`init`、`pull`、`sync`。

## 概览

```bash
wp-next <command> [options]

Commands:
  init        扫描 WordPress 站点并生成 Next.js 项目
  pull        从 WordPress 拉取内容
  sync        增量同步 — 只拉取自上次同步以来变更的内容
```

## 通用选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--url <url>` | WordPress 站点 URL | *（必填）* |
| `--mode <mode>` | 数据源：`rest` 或 `hmac`；`graphql` 暂未实现 | `rest` |
| `--hmac-secret <secret>` | HMAC 共享密钥（`--mode hmac`） | — |
| `--output <path>` | 输出目录 | `content` |
| `--type <type>` | 文章类型 | `posts` |
