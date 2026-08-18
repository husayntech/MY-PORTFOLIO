const { initApp, createApp, saveDb } = require('./app');

const PORT = process.env.PORT || 3001;

async function startServer() {
  await initApp();

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

  process.on('SIGINT', () => { saveDb(); process.exit(0); });
  process.on('SIGTERM', () => { saveDb(); process.exit(0); });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
