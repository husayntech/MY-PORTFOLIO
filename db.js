/**
 * Database adapter — supports two backends:
 *   1. Supabase / PostgreSQL (cloud) — when DATABASE_URL is set
 *   2. sql.js (local file) — fallback for local development
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'portfolio.db');

let db = null;
let pool = null;
let isSupabase = false;

// ── Convert ? placeholders to $1,$2 for PostgreSQL ─────────────

function toPg(sql, params) {
  let i = 0;
  const converted = sql.replace(/\?/g, () => `$${++i}`);
  return { sql: converted, params };
}

// ── PostgreSQL helpers ─────────────────────────────────────────

async function pgRun(sql, params = []) {
  const { sql: pgSql, params: pgParams } = toPg(sql, params);
  const client = await pool.connect();
  try { await client.query(pgSql, pgParams); }
  finally { client.release(); }
}

async function pgGet(sql, params = []) {
  const { sql: pgSql, params: pgParams } = toPg(sql, params);
  const client = await pool.connect();
  try {
    const result = await client.query(pgSql, pgParams);
    return result.rows[0] || null;
  } finally { client.release(); }
}

async function pgAll(sql, params = []) {
  const { sql: pgSql, params: pgParams } = toPg(sql, params);
  const client = await pool.connect();
  try {
    const result = await client.query(pgSql, pgParams);
    return result.rows || [];
  } finally { client.release(); }
}

// ── sql.js helpers (local) ────────────────────────────────────

function localRun(sql, params = []) {
  const safe = params.map(p => (p === undefined ? null : p));
  db.run(sql, safe);
  saveDb();
}

function localGet(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
  stmt.free();
  return null;
}

function localAll(sql, params = []) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) { results.push(stmt.getAsObject()); }
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

// ── Public API ────────────────────────────────────────────────

async function dbRun(sql, params = []) {
  if (isSupabase) return pgRun(sql, params);
  return localRun(sql, params);
}

async function dbGet(sql, params = []) {
  if (isSupabase) return pgGet(sql, params);
  return localGet(sql, params);
}

async function dbAll(sql, params = []) {
  if (isSupabase) return pgAll(sql, params);
  return localAll(sql, params);
}

function getDbSave() { return saveDb; }

// ── CREATE TABLE SQL (single statement) ───────────────────────

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'admin', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS sections (id SERIAL PRIMARY KEY, section_key TEXT UNIQUE NOT NULL, title TEXT, subtitle TEXT, content TEXT, image_url TEXT, is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, technologies TEXT, image_url TEXT, project_url TEXT, is_featured INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT DEFAULT 'technical', proficiency INTEGER DEFAULT 50, icon TEXT, is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, icon TEXT, is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, client_name TEXT NOT NULL, client_title TEXT, client_image TEXT, content TEXT, rating INTEGER DEFAULT 5, is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS style_settings (id SERIAL PRIMARY KEY, setting_key TEXT UNIQUE NOT NULL, setting_value TEXT, setting_type TEXT DEFAULT 'color', category TEXT DEFAULT 'colors', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS site_config (id SERIAL PRIMARY KEY, config_key TEXT UNIQUE NOT NULL, config_value TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS analytics (id SERIAL PRIMARY KEY, event_type TEXT NOT NULL, page_url TEXT, ip_address TEXT, user_agent TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
`;

const SEED_EDUCATION = JSON.stringify([
  { title: 'Bachelor of Arts (Education) in Islamic Studies', institution: 'University of Ilorin', description: 'Studied Islamic Studies Education.' },
  { title: "I'dādiyyah & Thānawiyyah Certificates", institution: "Dārul-'Ulūm Isalekoto", description: "Completed structured studies in Islamic sciences." },
  { title: "Qur'anic Memorization & Tajwid", institution: "Dārul-'Ulūm Isalekoto", description: "Completed Qur'anic memorization alongside Tajwid training." },
  { title: 'Desktop Publishing & Programming', institution: 'Self-taught', description: 'Developed practical skills in desktop publishing and programming.' }
]);

const SEED_COMPETENCIES = JSON.stringify([
  { name: 'Islamic Studies', icon: 'mosque' },
  { name: "Qur'anic Memorization", icon: 'menu_book' },
  { name: 'Tajwid', icon: 'record_voice_over' },
  { name: 'Arabic Language', icon: 'translate' },
  { name: 'EdTech', icon: 'school' },
  { name: 'UI/UX Design', icon: 'design_services' },
  { name: 'Digital Learning', icon: 'devices' }
]);

// ── Initialization ─────────────────────────────────────────────

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // ── Supabase / PostgreSQL mode ──
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000
    });

    // Test connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL');
    } finally {
      client.release();
    }

    isSupabase = true;

    // Create all tables in one go
    await pool.query(CREATE_TABLES_SQL);
    console.log('✅ Tables ready');

    // Seed admin (single query, ignore if exists)
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING",
      ['admin', hash, 'admin']
    );

    // Seed config (single upsert)
    await pool.query(
      "INSERT INTO site_config (config_key, config_value) VALUES ($1, $2) ON CONFLICT (config_key) DO NOTHING",
      ['education_items', SEED_EDUCATION]
    );
    await pool.query(
      "INSERT INTO site_config (config_key, config_value) VALUES ($1, $2) ON CONFLICT (config_key) DO NOTHING",
      ['core_competencies', SEED_COMPETENCIES]
    );

    console.log('✅ Database seeded');

  } else {
    // ── Local sql.js mode ──
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      db = new SQL.Database(fs.readFileSync(DB_PATH));
      console.log('✅ Database loaded');
    } else {
      console.log('📁 Creating new database...');
      db = new SQL.Database();
      if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
      }
      require('./scripts/init-db.js');
      db = new SQL.Database(fs.readFileSync(DB_PATH));
    }

    try {
      const res = db.exec("PRAGMA table_info(testimonials)");
      const cols = res.length ? res[0].values : [];
      if (!cols.some(row => row[1] === 'sort_order')) {
        db.run("ALTER TABLE testimonials ADD COLUMN sort_order INTEGER DEFAULT 0");
        saveDb();
      }
    } catch (e) {}

    function ensureConfig(key, value) {
      const existing = localGet('SELECT config_key FROM site_config WHERE config_key = ?', [key]);
      if (!existing) localRun('INSERT INTO site_config (config_key, config_value) VALUES (?, ?)', [key, value]);
    }
    ensureConfig('education_items', SEED_EDUCATION);
    ensureConfig('core_competencies', SEED_COMPETENCIES);

    console.log('✅ Local SQLite database ready');
  }
}

module.exports = { initDatabase, dbRun, dbGet, dbAll, getDbSave };
