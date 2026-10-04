const { getState } = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    var state = await getState();
    res.status(200).json(state); // null until the owner's first Publish; auth is a separate KV key, never stored here
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
};
