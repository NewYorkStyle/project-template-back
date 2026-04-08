# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN pnpm install --frozen-lockfile

COPY src/ ./src/

# Генерим Prisma client
RUN pnpm prisma generate

# Билдим Nest
RUN pnpm run build

# Удаляем dev-зависимости
RUN pnpm prune --prod


# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем всё нужное
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/src/main.js"]