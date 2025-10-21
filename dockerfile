FROM node:18-alpine

WORKDIR /app

# 1. Копируем файлы конфигурации
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 2. Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm ci

# 3. Копируем исходный код
COPY src/ ./src/
COPY db_migration/ ./db_migration/

# 4. Собираем приложение
RUN npm run build

# 5. Удаляем dev зависимости после сборки
RUN npm prune --production

EXPOSE 3000

# Команда запуска с миграциями
CMD sh -c "npm run migrate && node dist/src/main"