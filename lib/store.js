const { Redis } = require('@upstash/redis');

const kv = Redis.fromEnv();

const STATE_KEY = 'taginc:state';
const AUTH_KEY = 'taginc:auth';

async function getState() {
  var st = await kv.get(STATE_KEY);
  return st || null;
}

async function setState(next) {
  await kv.set(STATE_KEY, next);
}

async function getAuth() {
  var a = await kv.get(AUTH_KEY);
  return a || null;
}

async function setAuth(auth) {
  await kv.set(AUTH_KEY, auth);
}

module.exports = { kv: kv, getState: getState, setState: setState, getAuth: getAuth, setAuth: setAuth };
