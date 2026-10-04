const { getAuth } = require('../../lib/store');
const { isLoggedIn } = require('../../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  var auth = await getAuth();
  res.status(200).json({ loggedIn: isLoggedIn(req), ownerExists: !!auth });
};
