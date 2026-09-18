const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, query } = require('./db');
const Club = require('./models/Club');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------- API ---------------- */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/me', require('./routes/meRoutes'));

// Category list with a club count each, used by the filter bar.
app.get('/api/categories', async (req, res) => {
  try {
    res.json(await Club.categories());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Headline numbers for the home page.
app.get('/api/stats', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM clubs) AS clubs,
        (SELECT COUNT(*)::int FROM categories) AS categories,
        (SELECT COUNT(*)::int FROM events WHERE event_date >= CURRENT_DATE) AS upcoming_events,
        (SELECT COALESCE(SUM(base_members), 0)::int FROM clubs)
          + (SELECT COUNT(*)::int FROM memberships WHERE status = 'approved') AS members
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The campus noticeboard.
app.get('/api/announcements', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT a.*, c.name AS club_name, c.slug AS club_slug, cat.accent AS category_accent
       FROM announcements a
       LEFT JOIN clubs c ON c.id = a.club_id
       LEFT JOIN categories cat ON cat.slug = c.category
       ORDER BY a.pinned DESC, a.created_at DESC LIMIT 8`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Photos from recent campus events.
app.get('/api/gallery', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT g.*, c.name AS club_name, c.slug AS club_slug
       FROM gallery g LEFT JOIN clubs c ON c.id = g.club_id
       ORDER BY g.id LIMIT 12`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'unreachable', error: err.message });
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'No such endpoint.' }));

/* ---------------- Front end ---------------- */
// The single page app handles its own routing, so anything else serves index.html.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side.' });
});

/* ---------------- Start ---------------- */
const PORT = process.env.PORT || 5000;

pool.query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Campus ClubHub is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Could not reach PostgreSQL:', err.message);
    console.error('Start PostgreSQL, check .env, then run: npm run db:setup && npm run db:seed');
    process.exit(1);
  });
