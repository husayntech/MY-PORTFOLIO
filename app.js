const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const { initDatabase, dbRun, dbGet, dbAll, getDbSave } = require('./db');

require('dotenv').config();

// ============ CREATE EXPRESS APP ============

function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(compression());
  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'sulyman-portfolio-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  // Static files
  app.use('/static', express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

  // Serve HTML pages with saved styles + content
  const PAGE_FILES = {
    '/': 'index.html', '/index.html': 'index.html',
    '/projects': 'projects.html', '/projects.html': 'projects.html',
    '/admin': 'admin.html', '/admin.html': 'admin.html'
  };

  app.use((req, res, next) => {
    const file = PAGE_FILES[req.path];
    if (!file || req.method !== 'GET') return next();
    // Fire-and-forget analytics (don't block page render)
    if (req.path === '/') {
      dbRun("INSERT INTO analytics (event_type, page_url, ip_address, user_agent) VALUES ('page_view', '/', ?, ?)",
        [req.ip, req.get('user-agent')]).catch(() => {});
    }
    try {
      const styles = {};
      const config = {};
      // Use sync-safe approach: read from DB then render
      Promise.all([
        dbAll('SELECT * FROM style_settings'),
        dbAll('SELECT * FROM site_config')
      ]).then(([stylesRows, configRows]) => {
        stylesRows.forEach(s => { styles[s.setting_key] = s.setting_value; });
        configRows.forEach(c => { config[c.config_key] = c.config_value; });
        let html = fs.readFileSync(path.join(__dirname, 'public', file), 'utf8');
        const data = JSON.stringify({ styles, config }).replace(/</g, '\\u003c');
        const tag = '<script>window.__INITIAL_DATA__ = ' + data + ';</script>';
        html = html.replace('<script src="/editor.js"></script>', tag + '\n    <script src="/editor.js"></script>');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.type('html').send(html);
      }).catch(err => {
        console.error('Error rendering page:', err);
        res.status(500).json({ error: 'Failed to render page' });
      });
    } catch (err) {
      console.error('Error rendering page:', err);
      res.status(500).json({ error: 'Failed to render page' });
    }
  });

  app.use(express.static(path.join(__dirname, 'public'), { index: false }));

  // Make db available to routes
  app.use((req, res, next) => {
    req.dbRun = dbRun;
    req.dbGet = dbGet;
    req.dbAll = dbAll;
    next();
  });

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // ============ AUTH ============
  const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  };

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });

  app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.userId) {
      res.json({ authenticated: true, user: { id: req.session.userId, username: req.session.username, role: req.session.role } });
    } else {
      res.json({ authenticated: false });
    }
  });

  // ============ SECTIONS API ============
  app.get('/api/sections', async (req, res) => {
    try {
      res.json(await dbAll('SELECT * FROM sections WHERE is_visible = 1 ORDER BY sort_order'));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/sections/:key', async (req, res) => {
    try {
      const section = await dbGet('SELECT * FROM sections WHERE section_key = ?', [req.params.key]);
      if (!section) return res.status(404).json({ error: 'Section not found' });
      res.json(section);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/sections/:key', requireAuth, async (req, res) => {
    try {
      const { title, subtitle, content, image_url, is_visible, sort_order } = req.body;
      await dbRun(`UPDATE sections SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), content = COALESCE(?, content), image_url = COALESCE(?, image_url), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE section_key = ?`,
        [title, subtitle, content, image_url, is_visible, sort_order, req.params.key]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ PROJECTS API ============
  app.get('/api/projects', async (req, res) => {
    try {
      res.json(await dbAll('SELECT * FROM projects WHERE is_visible = 1 ORDER BY sort_order'));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await dbGet('SELECT * FROM projects WHERE id = ?', [parseInt(req.params.id)]);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
    try {
      const { title, description, technologies, image_url, project_url, is_featured, sort_order } = req.body;
      let finalOrder = sort_order;
      if (finalOrder === undefined || finalOrder === null) {
        const maxRow = await dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM projects');
        finalOrder = (maxRow?.m || 0) + 1;
      }
      await dbRun(`INSERT INTO projects (title, description, technologies, image_url, project_url, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, technologies, image_url, project_url, is_featured || 0, finalOrder]);
      const lastId = await dbGet('SELECT last_insert_rowid() as id');
      res.json({ success: true, id: lastId?.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      const { title, description, technologies, image_url, project_url, is_featured, is_visible, sort_order } = req.body;
      await dbRun(`UPDATE projects SET title = COALESCE(?, title), description = COALESCE(?, description), technologies = COALESCE(?, technologies), image_url = COALESCE(?, image_url), project_url = COALESCE(?, project_url), is_featured = COALESCE(?, is_featured), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?`,
        [title, description, technologies, image_url, project_url, is_featured, is_visible, sort_order, parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      await dbRun('DELETE FROM projects WHERE id = ?', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ SKILLS API ============
  app.get('/api/skills', async (req, res) => {
    try {
      const { category } = req.query;
      if (category) {
        res.json(await dbAll('SELECT * FROM skills WHERE category = ? AND is_visible = 1 ORDER BY sort_order', [category]));
      } else {
        res.json(await dbAll('SELECT * FROM skills WHERE is_visible = 1 ORDER BY sort_order'));
      }
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/skills', requireAuth, async (req, res) => {
    try {
      const { name, category, proficiency, icon, sort_order } = req.body;
      let finalOrder = sort_order;
      if (finalOrder === undefined || finalOrder === null) {
        const maxRow = await dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM skills WHERE category = ?', [category || 'technical']);
        finalOrder = (maxRow?.m || 0) + 1;
      }
      await dbRun('INSERT INTO skills (name, category, proficiency, icon, sort_order) VALUES (?, ?, ?, ?, ?)', [name, category, proficiency, icon, finalOrder]);
      const lastId = await dbGet('SELECT last_insert_rowid() as id');
      res.json({ success: true, id: lastId?.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/skills/:id', requireAuth, async (req, res) => {
    try {
      const { name, category, proficiency, icon, is_visible, sort_order } = req.body;
      await dbRun('UPDATE skills SET name = COALESCE(?, name), category = COALESCE(?, category), proficiency = COALESCE(?, proficiency), icon = COALESCE(?, icon), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order) WHERE id = ?',
        [name, category, proficiency, icon, is_visible, sort_order, parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete('/api/skills/:id', requireAuth, async (req, res) => {
    try {
      await dbRun('DELETE FROM skills WHERE id = ?', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ SERVICES API ============
  app.get('/api/services', async (req, res) => {
    try {
      res.json(await dbAll('SELECT * FROM services WHERE is_visible = 1 ORDER BY sort_order'));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/services', requireAuth, async (req, res) => {
    try {
      const { title, description, icon, sort_order } = req.body;
      let finalOrder = sort_order;
      if (finalOrder === undefined || finalOrder === null) {
        const maxRow = await dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM services');
        finalOrder = (maxRow?.m || 0) + 1;
      }
      await dbRun('INSERT INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)', [title, description, icon, finalOrder]);
      const lastId = await dbGet('SELECT last_insert_rowid() as id');
      res.json({ success: true, id: lastId?.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/services/:id', requireAuth, async (req, res) => {
    try {
      const { title, description, icon, is_visible, sort_order } = req.body;
      await dbRun('UPDATE services SET title = COALESCE(?, title), description = COALESCE(?, description), icon = COALESCE(?, icon), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order) WHERE id = ?',
        [title, description, icon, is_visible, sort_order, parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete('/api/services/:id', requireAuth, async (req, res) => {
    try {
      await dbRun('DELETE FROM services WHERE id = ?', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ TESTIMONIALS API ============
  app.get('/api/testimonials', async (req, res) => {
    try {
      res.json(await dbAll('SELECT * FROM testimonials WHERE is_visible = 1 ORDER BY sort_order, created_at DESC'));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/testimonials', requireAuth, async (req, res) => {
    try {
      const { client_name, client_title, client_image, content, rating, sort_order } = req.body;
      let finalOrder = sort_order;
      if (finalOrder === undefined || finalOrder === null) {
        const maxRow = await dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM testimonials');
        finalOrder = (maxRow?.m || 0) + 1;
      }
      await dbRun('INSERT INTO testimonials (client_name, client_title, client_image, content, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [client_name, client_title, client_image, content, rating || 5, finalOrder]);
      const lastId = await dbGet('SELECT last_insert_rowid() as id');
      res.json({ success: true, id: lastId?.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/testimonials/:id', requireAuth, async (req, res) => {
    try {
      const { client_name, client_title, client_image, content, rating, is_visible, sort_order } = req.body;
      await dbRun('UPDATE testimonials SET client_name = COALESCE(?, client_name), client_title = COALESCE(?, client_title), client_image = COALESCE(?, client_image), content = COALESCE(?, content), rating = COALESCE(?, rating), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order) WHERE id = ?',
        [client_name, client_title, client_image, content, rating, is_visible, sort_order, parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete('/api/testimonials/:id', requireAuth, async (req, res) => {
    try {
      await dbRun('DELETE FROM testimonials WHERE id = ?', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ CONTACTS API ============
  app.post('/api/contacts', async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }
      await dbRun('INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)', [name, email, phone, subject, message]);
      dbRun("INSERT INTO analytics (event_type, page_url, ip_address, user_agent) VALUES ('contact_form', ?, ?, ?)",
        [req.body.pageUrl || '/', req.ip, req.get('user-agent')]).catch(() => {});
      const lastId = await dbGet('SELECT last_insert_rowid() as id');
      res.json({ success: true, id: lastId?.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/contacts', requireAuth, async (req, res) => {
    try {
      res.json(await dbAll('SELECT * FROM contacts ORDER BY created_at DESC'));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/contacts/:id/read', requireAuth, async (req, res) => {
    try {
      await dbRun('UPDATE contacts SET is_read = 1 WHERE id = ?', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete('/api/contacts/:id', requireAuth, async (req, res) => {
    try {
      await dbRun('DELETE FROM contacts WHERE id = ?', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ STYLES API ============
  app.get('/api/styles', async (req, res) => {
    try {
      const { category } = req.query;
      let styles;
      if (category) {
        styles = await dbAll('SELECT * FROM style_settings WHERE category = ?', [category]);
      } else {
        styles = await dbAll('SELECT * FROM style_settings');
      }
      const stylesObj = {};
      styles.forEach(s => { stylesObj[s.setting_key] = s.setting_value; });
      res.json(stylesObj);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/styles', async (req, res) => {
    try {
      const styles = req.body;
      for (const [key, value] of Object.entries(styles)) {
        const isFont = key.includes('font');
        await dbRun('INSERT OR IGNORE INTO style_settings (setting_key, setting_value, setting_type, category) VALUES (?, ?, ?, ?)',
          [key, String(value), isFont ? 'font' : 'color', isFont ? 'typography' : 'colors']);
        await dbRun("UPDATE style_settings SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = ?",
          [String(value), key]);
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ SITE CONFIG API ============
  app.get('/api/config', async (req, res) => {
    try {
      const configs = await dbAll('SELECT * FROM site_config');
      const configObj = {};
      configs.forEach(c => { configObj[c.config_key] = c.config_value; });
      res.json(configObj);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/config', async (req, res) => {
    try {
      const configs = req.body;
      for (const [key, value] of Object.entries(configs)) {
        await dbRun('INSERT OR IGNORE INTO site_config (config_key, config_value) VALUES (?, ?)', [key, String(value)]);
        await dbRun("UPDATE site_config SET config_value = ?, updated_at = datetime('now') WHERE config_key = ?", [String(value), key]);
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ ANALYTICS API ============
  app.post('/api/analytics', async (req, res) => {
    try {
      const { event_type, page_url } = req.body;
      await dbRun('INSERT INTO analytics (event_type, page_url, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [event_type, page_url, req.ip, req.get('user-agent')]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/analytics', requireAuth, async (req, res) => {
    try {
      const { period } = req.query;
      let query = 'SELECT * FROM analytics';
      let countQuery = "SELECT COUNT(*) as count FROM analytics WHERE event_type = 'page_view'";
      let todayQuery = "SELECT COUNT(*) as count FROM analytics WHERE event_type = 'page_view' AND DATE(created_at) = DATE('now')";

      if (period === 'today') {
        query += " WHERE DATE(created_at) = DATE('now')";
      } else if (period === 'week') {
        query += " WHERE created_at >= datetime('now', '-7 days')";
      } else if (period === 'month') {
        query += " WHERE created_at >= datetime('now', '-30 days')";
      }

      query += ' ORDER BY created_at DESC LIMIT 1000';

      const analytics = await dbAll(query);
      const totalVisits = await dbGet(countQuery);
      const todayVisits = await dbGet(todayQuery);
      const totalContacts = await dbGet('SELECT COUNT(*) as count FROM contacts');
      const unreadContacts = await dbGet('SELECT COUNT(*) as count FROM contacts WHERE is_read = 0');

      res.json({
        data: analytics,
        stats: {
          totalVisits: totalVisits?.count || 0,
          todayVisits: todayVisits?.count || 0,
          totalContacts: totalContacts?.count || 0,
          unreadContacts: unreadContacts?.count || 0
        }
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============ FILE UPLOAD API ============
  const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
      cb(null, name);
    }
  });

  const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|gif|webp|svg/;
      const extname = allowed.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowed.test(file.mimetype);
      if (extname && mimetype) return cb(null, true);
      cb(new Error('Only image files are allowed'));
    }
  });

  app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ success: true, url: '/uploads/' + req.file.filename });
  });

  // ============ ERROR HANDLING ============
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { initDatabase, createApp };
