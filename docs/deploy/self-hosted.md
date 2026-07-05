# Self-Hosted

Deploy wp-next on any Node.js server.

## Docker

```dockerfile
# Dockerfile
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/
COPY packages/react/package.json packages/react/
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npx", "next", "start"]
```

```bash
docker build -t wp-next .
docker run -p 3000:3000 -e WP_URL=https://your-wp-site.com wp-next
```

## PM2

```bash
npm install -g pm2
pnpm build
pm2 start npm --name "wp-next" -- start
pm2 save
pm2 startup
```

## NGINX Reverse Proxy

```nginx
server {
    listen 80;
    server_name mysite.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

```bash
export WP_URL=https://your-wp-site.com
export REVALIDATE_SECRET=your-secret-key
export NODE_ENV=production
```
