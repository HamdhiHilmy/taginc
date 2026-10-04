const { put } = require('@vercel/blob');
const crypto = require('crypto');
const { isLoggedIn } = require('../lib/session');

const MAX_BYTES = 5 * 1024 * 1024;
const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!isLoggedIn(req)) { res.status(401).json({ error: 'not_signed_in' }); return; }

  var body = req.body;
  var dataUrl = body && body.dataUrl;
  var m = typeof dataUrl === 'string' && dataUrl.match(DATA_URL_RE);
  if (!m) { res.status(400).json({ error: 'bad_image' }); return; }

  var contentType = m[1];
  var buf = Buffer.from(m[2], 'base64');
  if (buf.length === 0 || buf.length > MAX_BYTES) { res.status(413).json({ error: 'too_large' }); return; }

  var ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  var name = 'photos/' + Date.now().toString(36) + '-' + crypto.randomBytes(6).toString('hex') + '.' + ext;

  try {
    var blob = await put(name, buf, { access: 'public', contentType: contentType });
    res.status(200).json({ url: blob.url });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
};
