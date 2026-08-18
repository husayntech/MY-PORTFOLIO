const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');

require('dotenv').config();

const DB_PATH = path.join(__dirname, 'data', 'portfolio.db');

let db;
let appReady = false;

// ============ DATABASE HELPERS ============

function dbRun(sql, params = []) {
  const safe = params.map(p => (p === undefined ? null : p));
  db.run(sql, safe);
  saveDb();
}

function dbGet(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function dbAll(sql, params = []) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function saveDb() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function ensureColumn(table, column, ddl) {
  try {
    const res = db.exec(`PRAGMA table_info(${table})`);
    const cols = res.length ? res[0].values : [];
    if (!cols.some(row => row[1] === column)) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
      saveDb();
      console.log(`✅ Migration: added column ${table}.${column}`);
    }
  } catch (err) {
    console.error(`Migration failed for ${table}.${column}:`, err);
  }
}

// ============ INITIALIZE APP ============

async function initApp() {
  if (appReady) return;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Database loaded');
  } else {
    console.log('📁 Creating new database...');
    db = new SQL.Database();
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
    require('./scripts/init-db.js');
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  }

  // Migrations
  ensureColumn('testimonials', 'sort_order', 'sort_order INTEGER DEFAULT 0');

  function ensureConfigDefault(key, value) {
    const existing = dbGet('SELECT config_key FROM site_config WHERE config_key = ?', [key]);
    if (!existing) {
      dbRun('INSERT INTO site_config (config_key, config_value) VALUES (?, ?)', [key, value]);
    }
  }
  ensureConfigDefault('education_items', JSON.stringify([
    { title: 'Bachelor of Arts (Education) in Islamic Studies', institution: 'University of Ilorin', description: 'Studied Islamic Studies Education with a focus on Islamic scholarship, educational methodology, teaching practices, and the effective transmission of Islamic knowledge. Developed a strong foundation in Islamic sciences alongside modern approaches to education.' },
    { title: "I'dādiyyah & Thānawiyyah Certificates", institution: "Dārul-'Ulūm Isalekoto", description: "Completed structured studies in Islamic sciences and Arabic language at both the I'dādiyyah and Thānawiyyah levels, developing a foundation in Arabic, Islamic jurisprudence, theology, and classical Islamic disciplines." },
    { title: "Qur'anic Memorization & Tajwid", institution: "Dārul-'Ulūm Isalekoto", description: "Completed Qur'anic memorization alongside structured Tajwid training — mastering the rules of recitation, articulation points, and the qualities of letters — building a strong foundation in accurate recitation with continued review to preserve it." },
    { title: 'Desktop Publishing & Programming', institution: 'Self-taught', description: 'Developed practical skills in desktop publishing — layout design, typography, and print-ready document production — alongside programming and modern web technologies through self-directed study, applied to creating educational materials and digital platforms.' }
  ]));
  ensureConfigDefault('core_competencies', JSON.stringify([
    { name: 'Islamic Studies', icon: 'mosque' },
    { name: "Qur'anic Memorization", icon: 'menu_book' },
    { name: 'Tajwid', icon: 'record_voice_over' },
    { name: 'Arabic Language', icon: 'translate' },
    { name: 'EdTech', icon: 'school' },
    { name: 'UI/UX Design', icon: 'design_services' },
    { name: 'Digital Learning', icon: 'devices' }
  ]));

  appReady = true;
}

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
    if (req.path === '/') {
      dbRun("INSERT INTO analytics (event_type, page_url, ip_address, user_agent) VALUES ('page_view', '/', ?, ?)",
        [req.ip, req.get('user-agent')]);
    }
    try {
      const styles = {};
      dbAll('SELECT * FROM style_settings').forEach(s => { styles[s.setting_key] = s.setting_value; });
      const config = {};
      dbAll('SELECT * FROM site_config').forEach(c => { config[c.config_key] = c.config_value; });
      let html = fs.readFileSync(path.join(__dirname, 'public', file), 'utf8');
      const data = JSON.stringify({ styles, config }).replace(/</g, '\\u003c');
      const tag = '<script>window.__INITIAL_DATA__ = ' + data + ';</script>';
      html = html.replace('<script src="/editor.js"></script>', tag + '\n    <script src="/editor.js"></script>');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.type('html').send(html);
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

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = dbGet('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
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
  app.get('/api/sections', (req, res) => {
    res.json(dbAll('SELECT * FROM sections WHERE is_visible = 1 ORDER BY sort_order'));
  });

  app.get('/api/sections/:key', (req, res) => {
    const section = dbGet('SELECT * FROM sections WHERE section_key = ?', [req.params.key]);
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  });

  app.put('/api/sections/:key', requireAuth, (req, res) => {
    const { title, subtitle, content, image_url, is_visible, sort_order } = req.body;
    dbRun(`UPDATE sections SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), content = COALESCE(?, content), image_url = COALESCE(?, image_url), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE section_key = ?`,
      [title, subtitle, content, image_url, is_visible, sort_order, req.params.key]);
    res.json({ success: true });
  });

  // ============ PROJECTS API ============
  app.get('/api/projects', (req, res) => {
    res.json(dbAll('SELECT * FROM projects WHERE is_visible = 1 ORDER BY sort_order'));
  });

  app.get('/api/projects/:id', (req, res) => {
    const project = dbGet('SELECT * FROM projects WHERE id = ?', [parseInt(req.params.id)]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  app.post('/api/projects', requireAuth, (req, res) => {
    const { title, description, technologies, image_url, project_url, is_featured, sort_order } = req.body;
    let finalOrder = sort_order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxRow = dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM projects');
      finalOrder = (maxRow?.m || 0) + 1;
    }
    dbRun(`INSERT INTO projects (title, description, technologies, image_url, project_url, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, technologies, image_url, project_url, is_featured || 0, finalOrder]);
    const lastId = dbGet('SELECT last_insert_rowid() as id');
    res.json({ success: true, id: lastId?.id });
  });

  app.put('/api/projects/:id', requireAuth, (req, res) => {
    const { title, description, technologies, image_url, project_url, is_featured, is_visible, sort_order } = req.body;
    dbRun(`UPDATE projects SET title = COALESCE(?, title), description = COALESCE(?, description), technologies = COALESCE(?, technologies), image_url = COALESCE(?, image_url), project_url = COALESCE(?, project_url), is_featured = COALESCE(?, is_featured), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?`,
      [title, description, technologies, image_url, project_url, is_featured, is_visible, sort_order, parseInt(req.params.id)]);
    res.json({ success: true });
  });

  app.delete('/api/projects/:id', requireAuth, (req, res) => {
    dbRun('DELETE FROM projects WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true });
  });

  // ============ SKILLS API ============
  app.get('/api/skills', (req, res) => {
    const { category } = req.query;
    if (category) {
      res.json(dbAll('SELECT * FROM skills WHERE category = ? AND is_visible = 1 ORDER BY sort_order', [category]));
    } else {
      res.json(dbAll('SELECT * FROM skills WHERE is_visible = 1 ORDER BY sort_order'));
    }
  });

  app.post('/api/skills', requireAuth, (req, res) => {
    const { name, category, proficiency, icon, sort_order } = req.body;
    let finalOrder = sort_order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxRow = dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM skills WHERE category = ?', [category || 'technical']);
      finalOrder = (maxRow?.m || 0) + 1;
    }
    dbRun('INSERT INTO skills (name, category, proficiency, icon, sort_order) VALUES (?, ?, ?, ?, ?)', [name, category, proficiency, icon, finalOrder]);
    const lastId = dbGet('SELECT last_insert_rowid() as id');
    res.json({ success: true, id: lastId?.id });
  });

  app.put('/api/skills/:id', requireAuth, (req, res) => {
    const { name, category, proficiency, icon, is_visible, sort_order } = req.body;
    dbRun('UPDATE skills SET name = COALESCE(?, name), category = COALESCE(?, category), proficiency = COALESCE(?, proficiency), icon = COALESCE(?, icon), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [name, category, proficiency, icon, is_visible, sort_order, parseInt(req.params.id)]);
    res.json({ success: true });
  });

  app.delete('/api/skills/:id', requireAuth, (req, res) => {
    dbRun('DELETE FROM skills WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true });
  });

  // ============ SERVICES API ============
  app.get('/api/services', (req, res) => {
    res.json(dbAll('SELECT * FROM services WHERE is_visible = 1 ORDER BY sort_order'));
  });

  app.post('/api/services', requireAuth, (req, res) => {
    const { title, description, icon, sort_order } = req.body;
    let finalOrder = sort_order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxRow = dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM services');
      finalOrder = (maxRow?.m || 0) + 1;
    }
    dbRun('INSERT INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)', [title, description, icon, finalOrder]);
    const lastId = dbGet('SELECT last_insert_rowid() as id');
    res.json({ success: true, id: lastId?.id });
  });

  app.put('/api/services/:id', requireAuth, (req, res) => {
    const { title, description, icon, is_visible, sort_order } = req.body;
    dbRun('UPDATE services SET title = COALESCE(?, title), description = COALESCE(?, description), icon = COALESCE(?, icon), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [title, description, icon, is_visible, sort_order, parseInt(req.params.id)]);
    res.json({ success: true });
  });

  app.delete('/api/services/:id', requireAuth, (req, res) => {
    dbRun('DELETE FROM services WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true });
  });

  // ============ TESTIMONIALS API ============
  app.get('/api/testimonials', (req, res) => {
    res.json(dbAll('SELECT * FROM testimonials WHERE is_visible = 1 ORDER BY sort_order, created_at DESC'));
  });

  app.post('/api/testimonials', requireAuth, (req, res) => {
    const { client_name, client_title, client_image, content, rating, sort_order } = req.body;
    let finalOrder = sort_order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxRow = dbGet('SELECT COALESCE(MAX(sort_order), 0) as m FROM testimonials');
      finalOrder = (maxRow?.m || 0) + 1;
    }
    dbRun('INSERT INTO testimonials (client_name, client_title, client_image, content, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [client_name, client_title, client_image, content, rating || 5, finalOrder]);
    const lastId = dbGet('SELECT last_insert_rowid() as id');
    res.json({ success: true, id: lastId?.id });
  });

  app.put('/api/testimonials/:id', requireAuth, (req, res) => {
    const { client_name, client_title, client_image, content, rating, is_visible, sort_order } = req.body;
    dbRun('UPDATE testimonials SET client_name = COALESCE(?, client_name), client_title = COALESCE(?, client_title), client_image = COALESCE(?, client_image), content = COALESCE(?, content), rating = COALESCE(?, rating), is_visible = COALESCE(?, is_visible), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [client_name, client_title, client_image, content, rating, is_visible, sort_order, parseInt(req.params.id)]);
    res.json({ success: true });
  });

  app.delete('/api/testimonials/:id', requireAuth, (req, res) => {
    dbRun('DELETE FROM testimonials WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true });
  });

  // ============ CONTACTS API ============
  app.post('/api/contacts', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    dbRun('INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)', [name, email, phone, subject, message]);
    dbRun("INSERT INTO analytics (event_type, page_url, ip_address, user_agent) VALUES ('contact_form', ?, ?, ?)",
      [req.body.pageUrl || '/', req.ip, req.get('user-agent')]);
    const lastId = dbGet('SELECT last_insert_rowid() as id');
    res.json({ success: true, id: lastId?.id });
  });

  app.get('/api/contacts', requireAuth, (req, res) => {
    res.json(dbAll('SELECT * FROM contacts ORDER BY created_at DESC'));
  });

  app.put('/api/contacts/:id/read', requireAuth, (req, res) => {
    dbRun('UPDATE contacts SET is_read = 1 WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true });
  });

  app.delete('/api/contacts/:id', requireAuth, (req, res) => {
    dbRun('DELETE FROM contacts WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true });
  });

  // ============ STYLES API ============
  app.get('/api/styles', (req, res) => {
    const { category } = req.query;
    let styles;
    if (category) {
      styles = dbAll('SELECT * FROM style_settings WHERE category = ?', [category]);
    } else {
      styles = dbAll('SELECT * FROM style_settings');
    }
    const stylesObj = {};
    styles.forEach(s => { stylesObj[s.setting_key] = s.setting_value; });
    res.json(stylesObj);
  });

  app.put('/api/styles', (req, res) => {
    const styles = req.body;
    for (const [key, value] of Object.entries(styles)) {
      const isFont = key.includes('font');
      dbRun('INSERT OR IGNORE INTO style_settings (setting_key, setting_value, setting_type, category) VALUES (?, ?, ?, ?)',
        [key, String(value), isFont ? 'font' : 'color', isFont ? 'typography' : 'colors']);
      dbRun("UPDATE style_settings SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = ?",
        [String(value), key]);
    }
    res.json({ success: true });
  });

  // ============ SITE CONFIG API ============
  app.get('/api/config', (req, res) => {
    const configs = dbAll('SELECT * FROM site_config');
    const configObj = {};
    configs.forEach(c => { configObj[c.config_key] = c.config_value; });
    res.json(configObj);
  });

  app.put('/api/config', (req, res) => {
    const configs = req.body;
    for (const [key, value] of Object.entries(configs)) {
      dbRun('INSERT OR IGNORE INTO site_config (config_key, config_value) VALUES (?, ?)', [key, String(value)]);
      dbRun("UPDATE site_config SET config_value = ?, updated_at = datetime('now') WHERE config_key = ?", [String(value), key]);
    }
    res.json({ success: true });
  });

  // ============ ANALYTICS API ============
  app.post('/api/analytics', (req, res) => {
    const { event_type, page_url } = req.body;
    dbRun('INSERT INTO analytics (event_type, page_url, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [event_type, page_url, req.ip, req.get('user-agent')]);
    res.json({ success: true });
  });

  app.get('/api/analytics', requireAuth, (req, res) => {
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

    const analytics = dbAll(query);
    const totalVisits = dbGet(countQuery);
    const todayVisits = dbGet(todayQuery);
    const totalContacts = dbGet('SELECT COUNT(*) as count FROM contacts');
    const unreadContacts = dbGet('SELECT COUNT(*) as count FROM contacts WHERE is_read = 0');

    res.json({
      data: analytics,
      stats: {
        totalVisits: totalVisits?.count || 0,
        todayVisits: todayVisits?.count || 0,
        totalContacts: totalContacts?.count || 0,
        unreadContacts: unreadContacts?.count || 0
      }
    });
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

// ============ EXPORTS ============

module.exports = { initApp, createApp, dbRun, dbGet, dbAll, saveDb };
