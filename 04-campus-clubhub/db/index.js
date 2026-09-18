const { Pool } = require('pg');
require('dotenv').config();

/**
 * A single shared connection pool for the whole app.
 * Every model file imports this instead of opening its own connection.
 */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

/** Run a query and get the rows back. */
const query = (text, params) => pool.query(text, params);

/** Run a query that is expected to return a single row (or null). */
const one = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
};

/** Run several statements inside a transaction. */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, one, transaction };
