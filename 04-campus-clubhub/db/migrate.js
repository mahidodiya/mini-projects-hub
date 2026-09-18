const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Schema applied. Tables are ready.');
  } catch (err) {
    console.error('Could not apply the schema:', err.message);
    console.error('Check that PostgreSQL is running and the values in .env are correct.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
