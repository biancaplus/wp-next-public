# 自托管

在任何 Node.js 服务器上部署 wp-next 生成的项目。

## Docker

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t my-blog .
docker run -p 3000:3000 -e WP_URL=https://your-wp-site.com my-blog
```

## PM2

```bash
npm install -g pm2
npm run build
pm2 start npm --name "my-blog" -- start
pm2 save && pm2 startup
```

## NGINX 反向代理

```nginx
server {
    listen 80;
    server_name mysite.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## 环境变量

```bash
export WP_URL=https://your-wp-site.com
export WP_NEXT_WEBHOOK_SECRET=your-secret
export NODE_ENV=production
```
