const router = require('express').Router();
const User = require('../models/User');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/me/clubs
router.get('/clubs', async (req, res) => {
  res.json(await User.clubs(req.user.id));
});

// GET /api/me/events
router.get('/events', async (req, res) => {
  res.json(await User.events(req.user.id));
});

// GET /api/me/requests  — pending requests for clubs this user leads
router.get('/requests', async (req, res) => {
  const { rows } = await query(
    `SELECT m.id, m.status, m.message, m.requested_at,
            u.name AS student_name, u.branch, u.year_of_study,
            c.name AS club_name, c.slug AS club_slug
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     JOIN clubs c ON c.id = m.club_id
     WHERE m.status = 'pending'
       AND ($1 = 'admin' OR c.id IN (
         SELECT club_id FROM memberships
         WHERE user_id = $2 AND status = 'approved' AND member_role <> 'member'
       ))
     ORDER BY m.requested_at ASC`,
    [req.user.role, req.user.id]
  );
  res.json(rows);
});

module.exports = router;
