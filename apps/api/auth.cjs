const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { requireThat } = require('./errors.cjs');
const scrypt = promisify(crypto.scrypt);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
async function hashPassword(password) {
  requireThat(typeof password === 'string' && password.length >= 12 && password.length <= 256,
    400, 'PASSWORD_POLICY', 'Use a password of 12–256 characters.');
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$32768$${salt}$${key.toString('hex')}`;
}
async function verifyPassword(password, encoded) {
  const [, cost, salt, expected] = encoded.split('$');
  const key = await scrypt(password, salt, 64, { N: Number(cost), r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return crypto.timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
function publicUser(user) {
  return { id: user.id, organisationId: user.organisation_id, email: user.email, name: user.name, role: user.role };
}
function authenticate(db, req) {
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('rushit_session='));
  requireThat(cookie, 401, 'AUTH_REQUIRED', 'Sign in to continue.');
  const token = cookie.slice('rushit_session='.length);
  const user = db.prepare(`SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at>? AND u.disabled=0`).get(hash(token), new Date().toISOString());
  requireThat(user, 401, 'SESSION_EXPIRED', 'Your session has expired. Sign in again.');
  return user;
}
function requireRole(user, ...roles) {
  requireThat(roles.includes(user.role), 403, 'FORBIDDEN', 'Your role cannot perform this action.');
}
module.exports = { hash, hashPassword, verifyPassword, publicUser, authenticate, requireRole };
