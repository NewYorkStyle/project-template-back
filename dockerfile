# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY src/ ./src/

# Генерим Prisma client
RUN npx prisma generate

# Билдим Nest
RUN npm run build

# Удаляем dev-зависимости, НЕ ломая prisma client
RUN npm prune --omit=dev


# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем всё нужное
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# ✅ Prisma migrate + запуск
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]