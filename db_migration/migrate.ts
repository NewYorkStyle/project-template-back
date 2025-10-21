/* eslint-disable no-console */
import {readFileSync, readdirSync} from 'fs';
import {join} from 'path';
import {Client} from 'pg';
import 'dotenv/config';

const client = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
});

const migrationDirectory = join(__dirname, './migrations');

// Создаем таблицу для отслеживания миграций
async function createMigrationsTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(createTableQuery);
}

// Проверяем, была ли миграция уже выполнена
async function isMigrationExecuted(migrationName: string): Promise<boolean> {
  const result = await client.query(
    'SELECT 1 FROM migrations WHERE name = $1',
    [migrationName]
  );
  return result.rows.length > 0;
}

// Добавляем запись о выполненной миграции
async function markMigrationAsExecuted(migrationName: string): Promise<void> {
  await client.query('INSERT INTO migrations (name) VALUES ($1)', [
    migrationName,
  ]);
}

async function runMigrations(): Promise<void> {
  try {
    await client.connect();

    // Создаем таблицу миграций если её нет
    await createMigrationsTable();

    const files = readdirSync(migrationDirectory)
      .filter((file: string) => file.endsWith('.sql'))
      .sort();

    let executedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      // Проверяем, была ли уже выполнена эта миграция
      if (await isMigrationExecuted(file)) {
        console.log(`Migration ${file} already executed, skipping...`);
        skippedCount++;
        continue;
      }

      const filePath = join(migrationDirectory, file);
      const sql = readFileSync(filePath, 'utf-8');

      console.log(`Running migration: ${file}`);
      try {
        await client.query('BEGIN'); // Начинаем транзакцию

        await client.query(sql);
        await markMigrationAsExecuted(file);

        await client.query('COMMIT'); // Подтверждаем транзакцию

        console.log(`Migration ${file} completed successfully.`);
        executedCount++;
      } catch (error: any) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
    }

    console.log(
      `\n✅ Migrations completed. Executed ${executedCount} new migrations, skipped ${skippedCount} already executed.`
    );
  } catch (error: any) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
