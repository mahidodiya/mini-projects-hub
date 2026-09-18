const bcrypt = require('bcryptjs');
const { pool } = require('./index');
const { CATEGORIES, CLUBS, EVENTS, ANNOUNCEMENTS } = require('./data');

/** Turn a day offset into a YYYY-MM-DD string. */
function dateFromOffset(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEMO_USERS = [
  { name: 'Aarav Mehta',      email: 'aarav@gecb.ac.in',   enrollment_no: 'GECB21CE014', branch: 'Computer Engineering', year_of_study: 4, role: 'lead',    password: 'student123' },
  { name: 'Ishita Raval',     email: 'ishita@gecb.ac.in',  enrollment_no: 'GECB22ME087', branch: 'Mechanical Engineering', year_of_study: 3, role: 'lead',  password: 'student123' },
  { name: 'Priya Desai',      email: 'priya@gecb.ac.in',   enrollment_no: 'GECB23IT102', branch: 'Information Technology', year_of_study: 2, role: 'student', password: 'student123' },
  { name: 'Dr. Neha Kapoor',  email: 'admin@gecb.ac.in',   enrollment_no: null,         branch: 'Student Affairs',        year_of_study: null, role: 'admin', password: 'admin123' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Start from a clean slate. TRUNCATE ... CASCADE also resets the id counters.
    await client.query(`
      TRUNCATE gallery, announcements, rsvps, events, memberships, clubs, categories, users
      RESTART IDENTITY CASCADE;
    `);

    /* ---------- categories ---------- */
    for (const c of CATEGORIES) {
      await client.query(
        `INSERT INTO categories (slug, name, blurb, accent, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.slug, c.name, c.blurb, c.accent, c.icon, c.sort_order]
      );
    }

    /* ---------- users ---------- */
    const userIds = {};
    for (const u of DEMO_USERS) {
      const hash = await bcrypt.hash(u.password, 10);
      const { rows } = await client.query(
        `INSERT INTO users (name, email, enrollment_no, branch, year_of_study, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [u.name, u.email, u.enrollment_no, u.branch, u.year_of_study, hash, u.role]
      );
      userIds[u.email] = rows[0].id;
    }

    /* ---------- clubs ---------- */
    const clubIds = {};
    for (const c of CLUBS) {
      const { rows } = await client.query(
        `INSERT INTO clubs
           (slug, name, category, tagline, description, cover_image, founded_year,
            meeting_day, meeting_time, venue, lead_name, faculty_advisor, contact_email,
            instagram, highlights, is_recruiting, is_featured, base_members)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING id`,
        [
          c.slug, c.name, c.category, c.tagline, c.description,
          `/img/clubs/${c.slug}.svg`, c.founded_year, c.meeting_day, c.meeting_time,
          c.venue, c.lead_name, c.faculty_advisor, c.contact_email, c.instagram,
          c.highlights, c.is_recruiting, c.is_featured, c.base_members,
        ]
      );
      clubIds[c.slug] = rows[0].id;
    }

    /* ---------- events ---------- */
    const eventIds = {};
    for (const e of EVENTS) {
      const { rows } = await client.query(
        `INSERT INTO events
           (club_id, title, description, event_date, start_time, end_time, venue,
            capacity, entry_fee, banner_image, tags, base_rsvps)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id`,
        [
          clubIds[e.club], e.title, e.description, dateFromOffset(e.dayOffset),
          e.start_time, e.end_time, e.venue, e.capacity, e.entry_fee,
          `/img/events/${e.slug}.svg`, e.tags, e.base_rsvps,
        ]
      );
      eventIds[e.slug] = rows[0].id;
    }

    /* ---------- announcements ---------- */
    for (const a of ANNOUNCEMENTS) {
      await client.query(
        `INSERT INTO announcements (club_id, title, body, pinned) VALUES ($1, $2, $3, $4)`,
        [a.club ? clubIds[a.club] : null, a.title, a.body, a.pinned]
      );
    }

    /* ---------- a few memberships and RSVPs so the demo account is not empty ---------- */
    const joins = [
      ['aarav@gecb.ac.in', 'code-forge', 'approved', 'President'],
      ['aarav@gecb.ac.in', 'reel-lens', 'approved', 'member'],
      ['aarav@gecb.ac.in', 'checkmate-chess', 'pending', 'member'],
      ['ishita@gecb.ac.in', 'circuit-lab', 'approved', 'President'],
      ['ishita@gecb.ac.in', 'trailblazers', 'approved', 'member'],
      ['priya@gecb.ac.in', 'aperture-photography', 'approved', 'member'],
      ['priya@gecb.ac.in', 'inkwell', 'approved', 'member'],
      ['priya@gecb.ac.in', 'e-cell', 'pending', 'member'],
    ];
    for (const [email, slug, status, role] of joins) {
      await client.query(
        `INSERT INTO memberships (club_id, user_id, status, member_role)
         VALUES ($1, $2, $3, $4)`,
        [clubIds[slug], userIds[email], status, role]
      );
    }

    const rsvps = [
      ['aarav@gecb.ac.in', 'hack-the-monsoon'],
      ['aarav@gecb.ac.in', 'friday-screening'],
      ['priya@gecb.ac.in', 'old-city-photowalk'],
      ['priya@gecb.ac.in', 'open-mic-night'],
      ['ishita@gecb.ac.in', 'robowars-qualifiers'],
    ];
    for (const [email, slug] of rsvps) {
      await client.query(
        `INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, 'going')`,
        [eventIds[slug], userIds[email]]
      );
    }

    /* ---------- gallery reuses the generated club artwork ---------- */
    const gallery = [
      ['unplugged-night', 'raag-music', 'Unplugged night fills the amphitheatre'],
      ['robowars-qualifiers', 'circuit-lab', 'Arena ready for the Robowars qualifiers'],
      ['old-city-photowalk', 'aperture-photography', 'Early light on the old city walk'],
      ['inter-dept-cricket', 'willow-cricket', 'The department cup goes to the last over'],
      ['spring-exhibition', 'palette-fine-arts', 'Sixty works hung across the atrium'],
      ['tree-plantation', 'prakriti-eco', 'Two hundred saplings along the north boundary'],
      ['demo-day', 'e-cell', 'Nine teams pitch on demo day'],
      ['street-play', 'manch-theatre', 'A circle forms for the lunchtime street play'],
    ];
    for (const [eventSlug, clubSlug, caption] of gallery) {
      await client.query(
        `INSERT INTO gallery (club_id, caption, image_url, taken_on)
         VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '40 days')`,
        [clubIds[clubSlug], caption, `/img/events/${eventSlug}.svg`]
      );
    }

    await client.query('COMMIT');

    console.log(`Seeded ${CATEGORIES.length} categories, ${CLUBS.length} clubs, ${EVENTS.length} events and ${ANNOUNCEMENTS.length} notices.`);
    console.log('Demo logins:  aarav@gecb.ac.in / student123   ·   admin@gecb.ac.in / admin123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
