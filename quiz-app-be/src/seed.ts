import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to Supabase');

  await AppDataSource.query(`
    INSERT INTO roles (name, description)
    VALUES
      ('STUDENT',  'Regular student account'),
      ('TEACHER',  'Teacher with class management access'),
      ('ADMIN',    'Full system administrator')
    ON CONFLICT (name) DO NOTHING;
  `);

  console.log('Roles seeded successfully');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
