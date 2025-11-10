/* eslint-disable no-console */
import {readFileSync, readdirSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import pg from 'pg';
import 'dotenv/config';

const {Client} = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
});

const migrationDirectory = join(__dirname, './migrations');

/**
 * Создаем таблицу для отслеживания миграций
 *
 * @returns {Promise<void>}
 */
async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(createTableQuery);
}

/**
 * Проверяем, была ли миграция уже выполнена
 *
 * @param {string} migrationName
 * @returns {Promise<boolean>}
 */
async function isMigrationExecuted(migrationName) {
  const result = await client.query(
    'SELECT 1 FROM migrations WHERE name = $1',
    [migrationName]
  );
  return result.rows.length > 0;
}

/**
 * Добавляем запись о выполненной миграции
 *
 * @param {string} migrationName
 * @returns {Promise<void>}
 */
async function markMigrationAsExecuted(migrationName) {
  await client.query('INSERT INTO migrations (name) VALUES ($1)', [
    migrationName,
  ]);
}

async function runMigrations() {
  try {
    await client.connect();

    // Создаем таблицу миграций если её нет
    await createMigrationsTable();

    const files = readdirSync(migrationDirectory)
      .filter((file) => file.endsWith('.sql'))
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
      } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
    }

    console.log(
      `\n✅ Migrations completed. Executed ${executedCount} new migrations, skipped ${skippedCount} already executed.`
    );
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
