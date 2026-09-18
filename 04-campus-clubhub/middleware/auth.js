const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/** Blocks the request unless a valid token is present. */
async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  try {
    const payload = jwt.verify(token, SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'That account no longer exists.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Sign in again.' });
  }
}

/** Attaches req.user when a token is present, but lets anonymous requests through. */
async function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = await User.findById(payload.id);
  } catch {
    // An expired token on a public page is not an error — carry on anonymously.
  }
  next();
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to do that.' });
  }
  next();
};

module.exports = { signToken, requireAuth, optionalAuth, requireRole };
