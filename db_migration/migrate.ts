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

async function runMigrations(): Promise<void> {
  try {
    await client.connect();
    const files = readdirSync(migrationDirectory)
      .filter((file: string) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = join(migrationDirectory, file);
      const sql = readFileSync(filePath, 'utf-8');

      console.log(`Running migration: ${file}`);
      try {
        await client.query(sql);

        console.log(`Migration ${file} completed successfully.`);
      } catch (error: any) {
        console.error(`Error running migration ${file}:`, error);

        process.exit(1);
      }
    }
  } catch (error: any) {
    console.error('Error running migrations:', error);

    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
