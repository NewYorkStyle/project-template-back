# Стадия сборки
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Копируем файлы конфигурации
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 2. Устанавливаем ВСЕ зависимости для сборки
RUN npm ci

# 3. Копируем исходный код
COPY src/ ./src/
COPY db_migration/ ./db_migration/

# 4. Собираем приложение
RUN npm run build

# 5. Устанавливаем ТОЛЬКО production зависимости
RUN npm ci --only=production

# Финальная стадия
FROM node:18-alpine

WORKDIR /app

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем production зависимости
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Копируем собранное приложение
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/db_migration ./db_migration

# Копируем package.json для корректной работы
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Команда запуска с миграциями
CMD ["sh", "-c", "npm run migrate && node dist/main.js"]
