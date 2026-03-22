# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma

RUN npm ci

COPY src/ ./src/

# Генерим Prisma клиент
RUN npx prisma generate

# Билдим Nest
RUN npm run build

# Оставляем только прод зависимости (prune не пересоздаёт node_modules — сохраняет prisma generate)
RUN npm prune --omit=dev


# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Важно: prisma тоже нужен!
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# ✅ Prisma migrate + запуск
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]