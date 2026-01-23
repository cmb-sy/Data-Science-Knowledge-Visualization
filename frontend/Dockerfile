# Node.jsベースイメージ（マルチステージビルド）
FROM node:18-alpine AS base

# 依存関係のインストール
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ビルダー
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数（ビルド時）
ENV NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Next.jsのビルド
RUN npm run build

# ランナー（本番用）
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next.js standaloneモードでは、.next/standaloneに必要なファイルがすべて含まれている

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# 開発用
FROM base AS dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

