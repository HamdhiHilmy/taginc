const crypto = require('crypto');

const COOKIE_NAME = 'taginc_session';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function secret() {
  var s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

function sign(payload) {
  var body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  var mac = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return body + '.' + mac;
}

function verify(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return null;
  var parts = token.split('.');
  var body = parts[0], mac = parts[1];
  var expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  var a = Buffer.from(mac);
  var b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    var payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function parseCookies(req) {
  var header = req.headers && req.headers.cookie;
  var out = {};
  if (!header) return out;
  header.split(';').forEach(function (part) {
    var i = part.indexOf('=');
    if (i === -1) return;
    var k = part.slice(0, i).trim();
    var v = part.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function isLoggedIn(req) {
  var cookies = parseCookies(req);
  return !!verify(cookies[COOKIE_NAME]);
}

function setSessionCookie(res) {
  var token = sign({ exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  res.setHeader('Set-Cookie',
    COOKIE_NAME + '=' + encodeURIComponent(token) +
    '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + MAX_AGE_SECONDS);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', COOKIE_NAME + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
}

module.exports = { isLoggedIn: isLoggedIn, setSessionCookie: setSessionCookie, clearSessionCookie: clearSessionCookie };
