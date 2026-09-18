/**
 * Drops and recreates the database named in .env, then exits.
 *
 * Useful on Windows where `psql` often isn't on PATH. This connects to the
 * built-in `postgres` maintenance database to do the drop/create, since you
 * cannot drop a database while connected to it.
 *
 * Run with:  npm run db:reset
 */
const { Client } = require('pg');
require('dotenv').config();

const targetDb = process.env.DB_NAME || 'clubhub';

async function reset() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    database: 'postgres', // connect to the maintenance DB, not the one we're dropping
  });

  try {
    await client.connect();

    // Terminate any other connections to the target database, or the drop will fail.
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid();`,
      [targetDb]
    );

    await client.query(`DROP DATABASE IF EXISTS "${targetDb}";`);
    console.log(`Dropped database "${targetDb}" (if it existed).`);

    await client.query(`CREATE DATABASE "${targetDb}";`);
    console.log(`Created a fresh database "${targetDb}".`);
    console.log('Now run: npm run db:setup && npm run db:seed');
  } catch (err) {
    console.error('Could not reset the database:', err.message);
    console.error('Check that PostgreSQL is running and DB_USER / DB_PASSWORD in .env are correct.');
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

reset();
