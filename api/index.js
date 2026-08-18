const serverless = require('serverless-http');
const { initApp, createApp } = require('../app');

let handler;

module.exports = async function (req, res) {
  if (!handler) {
    await initApp();
    const app = createApp();
    handler = serverless(app);
  }
  return handler(req, res);
};
