const router = require('express').Router();
const User = require('../models/User');
const { signToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, enrollment_no, branch, year_of_study } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are all required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Use a password of at least 8 characters.' });
  }
  if (await User.findByEmail(email)) {
    return res.status(409).json({ error: 'An account already uses that email. Sign in instead.' });
  }

  try {
    const user = await User.create({ name, email, password, enrollment_no, branch, year_of_study });
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }

  const user = await User.findByEmail(email);
  if (!user || !(await User.checkPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'That email and password do not match.' });
  }

  res.json({ user: User.toPublic(user), token: signToken(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;
