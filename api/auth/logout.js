const { clearSessionCookie } = require('../../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
};
