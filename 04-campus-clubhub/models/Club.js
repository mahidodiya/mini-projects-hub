const { query, one } = require('../db');

/**
 * Member and event counts are computed live: the approved memberships stored in
 * PostgreSQL plus the members carried over from the old paper register.
 */
const CLUB_SELECT = `
  SELECT c.*,
         cat.name  AS category_name,
         cat.accent AS category_accent,
         cat.icon   AS category_icon,
         c.base_members + COALESCE(m.approved, 0) AS member_count,
         COALESCE(e.upcoming, 0) AS upcoming_events
  FROM clubs c
  JOIN categories cat ON cat.slug = c.category
  LEFT JOIN (
    SELECT club_id, COUNT(*)::int AS approved
    FROM memberships WHERE status = 'approved' GROUP BY club_id
  ) m ON m.club_id = c.id
  LEFT JOIN (
    SELECT club_id, COUNT(*)::int AS upcoming
    FROM events WHERE event_date >= CURRENT_DATE GROUP BY club_id
  ) e ON e.club_id = c.id
`;

/** List clubs, optionally filtered by category or a search term. */
async function findAll({ category, search, recruiting, featured, sort = 'popular', limit } = {}) {
  const where = [];
  const params = [];

  if (category && category !== 'all') {
    params.push(category);
    where.push(`c.category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(c.name ILIKE $${params.length} OR c.tagline ILIKE $${params.length}
                 OR c.description ILIKE $${params.length} OR cat.name ILIKE $${params.length})`);
  }
  if (recruiting === true) where.push('c.is_recruiting = TRUE');
  if (featured === true) where.push('c.is_featured = TRUE');

  const orderBy = {
    popular: 'member_count DESC',
    name: 'c.name ASC',
    newest: 'c.founded_year DESC',
    oldest: 'c.founded_year ASC',
  }[sort] || 'member_count DESC';

  let sql = CLUB_SELECT;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY ${orderBy}`;
  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const { rows } = await query(sql, params);
  return rows;
}

const findBySlug = (slug) => one(`${CLUB_SELECT} WHERE c.slug = $1`, [slug]);
const findById = (id) => one(`${CLUB_SELECT} WHERE c.id = $1`, [id]);

async function create(data) {
  const slug = (data.slug || data.name)
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return one(
    `INSERT INTO clubs
       (slug, name, category, tagline, description, cover_image, founded_year,
        meeting_day, meeting_time, venue, lead_name, faculty_advisor, contact_email,
        instagram, highlights, is_recruiting)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING *`,
    [
      slug, data.name, data.category, data.tagline,
      data.description, data.cover_image || `/img/clubs/${slug}.svg`,
      data.founded_year || new Date().getFullYear(),
      data.meeting_day || 'To be announced', data.meeting_time || 'To be announced',
      data.venue || 'To be announced', data.lead_name, data.faculty_advisor || 'To be assigned',
      data.contact_email, data.instagram || null, data.highlights || [],
      data.is_recruiting !== false,
    ]
  );
}

/** The approved member roll for a club. */
async function members(clubId) {
  const { rows } = await query(
    `SELECT u.id, u.name, u.branch, u.year_of_study, m.member_role, m.requested_at
     FROM memberships m JOIN users u ON u.id = m.user_id
     WHERE m.club_id = $1 AND m.status = 'approved'
     ORDER BY m.requested_at ASC`,
    [clubId]
  );
  return rows;
}

const categories = async () => {
  const { rows } = await query(
    `SELECT cat.*, COUNT(c.id)::int AS club_count
     FROM categories cat LEFT JOIN clubs c ON c.category = cat.slug
     GROUP BY cat.slug ORDER BY cat.sort_order`
  );
  return rows;
};

module.exports = { findAll, findBySlug, findById, create, members, categories };
