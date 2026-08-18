const serverless = require('serverless-http');
const { initDatabase, createApp } = require('../app');

let handler;
let initPromise;

function getHandler() {
  if (!initPromise) {
    initPromise = (async () => {
      await initDatabase();
      const app = createApp();
      return serverless(app);
    })();
  }
  return initPromise;
}

module.exports = async function (req, res) {
  try {
    if (!handler) {
      handler = await getHandler();
    }
    return await handler(req, res);
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
