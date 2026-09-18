const router = require('express').Router();
const Event = require('../models/Event');
const Club = require('../models/Club');
const { query, one } = require('../db');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      scope: req.query.scope || 'upcoming',
      club: req.query.club,
      category: req.query.category,
      search: req.query.search,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'That event is not on the calendar.' });

    let rsvp = null;
    if (req.user) {
      rsvp = await one('SELECT status FROM rsvps WHERE event_id = $1 AND user_id = $2',
        [event.id, req.user.id]);
    }
    res.json({ ...event, rsvp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'That event is not on the calendar.' });
    if (new Date(event.event_date) < new Date(new Date().toDateString())) {
      return res.status(400).json({ error: 'That event has already happened.' });
    }
    if (event.seats_left <= 0) {
      return res.status(400).json({ error: 'Every seat is taken. Try the waiting list at the venue.' });
    }

    const status = req.body.status === 'maybe' ? 'maybe' : 'going';
    const rsvp = await one(
      `INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = EXCLUDED.status
       RETURNING status`,
      [event.id, req.user.id, status]
    );
    res.status(201).json({ message: `You are on the list for ${event.title}.`, rsvp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/events/:id/rsvp
router.delete('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM rsvps WHERE event_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'You were not registered for this one.' });
    res.json({ message: 'Your seat has been released.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/events  — club leads and staff
router.post('/', requireAuth, requireRole('lead', 'admin'), async (req, res) => {
  const { club_slug, title, description, event_date, start_time, venue } = req.body;
  if (!club_slug || !title || !event_date || !start_time || !venue) {
    return res.status(400).json({ error: 'An event needs a club, title, date, start time and venue.' });
  }
  try {
    const club = await Club.findBySlug(club_slug);
    if (!club) return res.status(404).json({ error: 'No club with that address.' });

    const event = await Event.create({
      ...req.body,
      club_id: club.id,
      description: description || '',
      banner_image: `/img/clubs/${club.slug}.svg`,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
