const bcrypt = require('bcryptjs');
const { query, one } = require('../db');

const PUBLIC_FIELDS = 'id, name, email, enrollment_no, branch, year_of_study, role, created_at';

const findByEmail = (email) =>
  one('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

const findById = (id) =>
  one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id]);

async function create({ name, email, password, enrollment_no, branch, year_of_study }) {
  const hash = await bcrypt.hash(password, 10);
  return one(
    `INSERT INTO users (name, email, enrollment_no, branch, year_of_study, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PUBLIC_FIELDS}`,
    [name, email.toLowerCase(), enrollment_no || null, branch || null, year_of_study || null, hash]
  );
}

const checkPassword = (plain, hash) => bcrypt.compare(plain, hash);

/** Strip the password hash before a user object ever leaves the server. */
const toPublic = (user) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

/** Clubs this user has joined or applied to. */
async function clubs(userId) {
  const { rows } = await query(
    `SELECT c.id, c.slug, c.name, c.tagline, c.cover_image, c.category,
            cat.accent AS category_accent, cat.name AS category_name,
            m.status, m.member_role, m.requested_at
     FROM memberships m
     JOIN clubs c ON c.id = m.club_id
     JOIN categories cat ON cat.slug = c.category
     WHERE m.user_id = $1
     ORDER BY m.requested_at DESC`,
    [userId]
  );
  return rows;
}

/** Events this user has RSVP'd to, upcoming first. */
async function events(userId) {
  const { rows } = await query(
    `SELECT e.id, e.title, e.event_date, e.start_time, e.venue, e.banner_image,
            c.name AS club_name, c.slug AS club_slug,
            cat.accent AS category_accent, r.status
     FROM rsvps r
     JOIN events e ON e.id = r.event_id
     JOIN clubs c ON c.id = e.club_id
     JOIN categories cat ON cat.slug = c.category
     WHERE r.user_id = $1
     ORDER BY e.event_date ASC`,
    [userId]
  );
  return rows;
}

module.exports = { findByEmail, findById, create, checkPassword, toPublic, clubs, events };
