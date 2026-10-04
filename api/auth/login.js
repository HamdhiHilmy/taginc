const crypto = require('crypto');
const { kv, getAuth } = require('../../lib/store');
const { setSessionCookie } = require('../../lib/session');

const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 10;

function deriveHash(username, password, saltHex, iter) {
  var material = username.trim().toLowerCase() + '\n' + password;
  return crypto.pbkdf2Sync(material, Buffer.from(saltHex, 'hex'), iter, 32, 'sha256').toString('hex');
}

function clientIp(req) {
  var fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function rateLimited(req) {
  var key = 'taginc:login-attempts:' + clientIp(req);
  var count = await kv.incr(key);
  if (count === 1) await kv.expire(key, WINDOW_SECONDS);
  return count > MAX_ATTEMPTS;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  if (await rateLimited(req)) { res.status(429).json({ error: 'rate_limited' }); return; }

  var auth = await getAuth();
  if (!auth) { res.status(404).json({ error: 'not_set_up' }); return; }

  var body = req.body || {};
  var username = typeof body.username === 'string' ? body.username : '';
  var password = typeof body.password === 'string' ? body.password : '';
  if (!username || !password) { res.status(400).json({ error: 'bad_request' }); return; }

  var hash = deriveHash(username, password, auth.salt, auth.iter);
  var a = Buffer.from(hash, 'hex');
  var b = Buffer.from(auth.hash, 'hex');
  var ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) { res.status(401).json({ error: 'invalid_credentials' }); return; }

  setSessionCookie(res);
  res.status(200).json({ ok: true });
};
