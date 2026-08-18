const { initDatabase, createApp } = require('./app');
const { getDbSave } = require('./db');

const PORT = process.env.PORT || 3001;

async function startServer() {
  await initDatabase();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║   🌙 Sulyman A.K. Portfolio Server                       ║
  ║                                                          ║
  ║   🚀 Server running on http://localhost:${PORT}            ║
  ║   📁 Portfolio: http://localhost:${PORT}                    ║
  ║   🔧 Admin: http://localhost:${PORT}/admin                  ║
  ║   🎨 Editor: http://localhost:${PORT}/editor                ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝\n`);
  });

  process.on('SIGINT', () => { getDbSave()(); process.exit(0); });
  process.on('SIGTERM', () => { getDbSave()(); process.exit(0); });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
