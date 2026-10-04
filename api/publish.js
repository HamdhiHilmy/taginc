const { setState } = require('../lib/store');
const { isLoggedIn } = require('../lib/session');

const MAX_BYTES = 2 * 1024 * 1024; // KV value size guardrail; photos live in Blob, so state itself should stay small

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!isLoggedIn(req)) { res.status(401).json({ error: 'not_signed_in' }); return; }

  var body = req.body;
  if (!body || typeof body !== 'object') { res.status(400).json({ error: 'bad_request' }); return; }

  var next = {
    logo: typeof body.logo === 'string' ? body.logo : '',
    photos: (body.photos && typeof body.photos === 'object') ? body.photos : {},
    products: Array.isArray(body.products) ? body.products : [],
    alts: (body.alts && typeof body.alts === 'object') ? body.alts : {},
    tints: (body.tints && typeof body.tints === 'object') ? body.tints : {},
    updated: new Date().toISOString()
  };
  // auth is never accepted here; it only ever changes via /api/auth/setup.

  if (Buffer.byteLength(JSON.stringify(next), 'utf8') > MAX_BYTES) {
    res.status(413).json({ error: 'too_large' });
    return;
  }

  try {
    await setState(next);
    res.status(200).json({ ok: true, updated: next.updated });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
};
