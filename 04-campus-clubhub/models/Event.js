const { query, one } = require('../db');

const EVENT_SELECT = `
  SELECT e.*,
         c.name AS club_name,
         c.slug AS club_slug,
         c.category,
         cat.accent AS category_accent,
         cat.icon   AS category_icon,
         e.base_rsvps + COALESCE(r.going, 0) AS rsvp_count,
         GREATEST(e.capacity - (e.base_rsvps + COALESCE(r.going, 0)), 0) AS seats_left
  FROM events e
  JOIN clubs c ON c.id = e.club_id
  JOIN categories cat ON cat.slug = c.category
  LEFT JOIN (
    SELECT event_id, COUNT(*)::int AS going FROM rsvps GROUP BY event_id
  ) r ON r.event_id = e.id
`;

async function findAll({ scope = 'upcoming', club, category, search, limit } = {}) {
  const where = [];
  const params = [];

  if (scope === 'upcoming') where.push('e.event_date >= CURRENT_DATE');
  if (scope === 'past') where.push('e.event_date < CURRENT_DATE');
  if (club) {
    params.push(club);
    where.push(`c.slug = $${params.length}`);
  }
  if (category && category !== 'all') {
    params.push(category);
    where.push(`c.category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(e.title ILIKE $${params.length} OR e.description ILIKE $${params.length}
                 OR c.name ILIKE $${params.length} OR e.venue ILIKE $${params.length})`);
  }

  let sql = EVENT_SELECT;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += scope === 'past'
    ? ' ORDER BY e.event_date DESC, e.start_time DESC'
    : ' ORDER BY e.event_date ASC, e.start_time ASC';
  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const { rows } = await query(sql, params);
  return rows;
}

const findById = (id) => one(`${EVENT_SELECT} WHERE e.id = $1`, [id]);

const create = (data) => one(
  `INSERT INTO events
     (club_id, title, description, event_date, start_time, end_time, venue,
      capacity, entry_fee, banner_image, tags)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
  [
    data.club_id, data.title, data.description, data.event_date,
    data.start_time, data.end_time || null, data.venue,
    data.capacity || 60, data.entry_fee || 0,
    data.banner_image || '/img/events/default.svg', data.tags || [],
  ]
);

module.exports = { findAll, findById, create };
