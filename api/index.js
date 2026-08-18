const serverless = require('serverless-http');
const { initDatabase, createApp } = require('../app');

let handler;

module.exports = async function (req, res) {
  if (!handler) {
    await initDatabase();
    const app = createApp();
    handler = serverless(app);
  }
  return handler(req, res);
};
