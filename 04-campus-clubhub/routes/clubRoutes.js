const router = require('express').Router();
const Club = require('../models/Club');
const Event = require('../models/Event');
const { query, one } = require('../db');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.findAll({
      category: req.query.category,
      search: req.query.search,
      recruiting: req.query.recruiting === 'true',
      featured: req.query.featured === 'true',
      sort: req.query.sort,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clubs/:slug  — full club page, including this user's membership status
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const club = await Club.findBySlug(req.params.slug);
    if (!club) return res.status(404).json({ error: 'No club with that address.' });

    const [events, members, announcements] = await Promise.all([
      Event.findAll({ club: club.slug, scope: 'all' }),
      Club.members(club.id),
      query('SELECT * FROM announcements WHERE club_id = $1 ORDER BY created_at DESC LIMIT 5', [club.id]),
    ]);

    let membership = null;
    if (req.user) {
      membership = await one(
        'SELECT status, member_role FROM memberships WHERE club_id = $1 AND user_id = $2',
        [club.id, req.user.id]
      );
    }

    res.json({ ...club, events, members, announcements: announcements.rows, membership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clubs/:slug/join
router.post('/:slug/join', requireAuth, async (req, res) => {
  try {
    const club = await Club.findBySlug(req.params.slug);
    if (!club) return res.status(404).json({ error: 'No club with that address.' });
    if (!club.is_recruiting) {
      return res.status(400).json({ error: `${club.name} is not taking new members right now.` });
    }

    const existing = await one(
      'SELECT status FROM memberships WHERE club_id = $1 AND user_id = $2',
      [club.id, req.user.id]
    );
    if (existing) {
      return res.status(409).json({
        error: existing.status === 'approved'
          ? `You are already a member of ${club.name}.`
          : 'Your request is already with the club leads.',
      });
    }

    const membership = await one(
      `INSERT INTO memberships (club_id, user_id, message) VALUES ($1, $2, $3)
       RETURNING status, requested_at`,
      [club.id, req.user.id, req.body.message || null]
    );
    res.status(201).json({ message: `Request sent to ${club.name}.`, membership });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clubs/:slug/join  — withdraw a request or leave the club
router.delete('/:slug/join', requireAuth, async (req, res) => {
  try {
    const club = await Club.findBySlug(req.params.slug);
    if (!club) return res.status(404).json({ error: 'No club with that address.' });

    const { rowCount } = await query(
      'DELETE FROM memberships WHERE club_id = $1 AND user_id = $2',
      [club.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'You are not on this club\u2019s roll.' });
    res.json({ message: `You have left ${club.name}.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/clubs  — staff only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, category, description, tagline, lead_name, contact_email } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({ error: 'A club needs a name, a category and a description.' });
  }
  try {
    const club = await Club.create({
      ...req.body,
      tagline: tagline || description.slice(0, 120),
      lead_name: lead_name || req.user.name,
      contact_email: contact_email || req.user.email,
    });
    res.status(201).json(club);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
