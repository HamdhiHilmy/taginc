const crypto = require('crypto');
const { getAuth, setAuth } = require('../../lib/store');
const { setSessionCookie } = require('../../lib/session');

function deriveHash(username, password, saltHex, iter) {
  var material = username.trim().toLowerCase() + '\n' + password;
  return crypto.pbkdf2Sync(material, Buffer.from(saltHex, 'hex'), iter, 32, 'sha256').toString('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  var existing = await getAuth();
  if (existing) { res.status(409).json({ error: 'already_set_up' }); return; }

  var body = req.body || {};
  var username = typeof body.username === 'string' ? body.username.trim() : '';
  var password = typeof body.password === 'string' ? body.password : '';
  if (username.length < 3) { res.status(400).json({ error: 'username_too_short' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'password_too_short' }); return; }

  var saltHex = crypto.randomBytes(16).toString('hex');
  var iter = 150000;
  var hash = deriveHash(username, password, saltHex, iter);

  try {
    await setAuth({ salt: saltHex, iter: iter, hash: hash });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
    return;
  }

  setSessionCookie(res);
  res.status(200).json({ ok: true });
};
