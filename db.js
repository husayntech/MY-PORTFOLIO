/**
 * Database adapter — supports two backends:
 *   1. Supabase / PostgreSQL (cloud) — when DATABASE_URL is set
 *   2. sql.js (local file) — fallback for local development
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'portfolio.db');

let db = null;          // sql.js instance (local mode)
let pool = null;        // pg Pool instance (supabase mode)
let isSupabase = false;

// ── Convert ? placeholders to $1,$2,... for PostgreSQL ─────────

function toPg(sql, params) {
  let i = 0;
  const converted = sql.replace(/\?/g, () => `$${++i}`);
  return { sql: converted, params };
}

// ── PostgreSQL helpers (Supabase) ─────────────────────────────

async function pgRun(sql, params = []) {
  const { sql: pgSql, params: pgParams } = toPg(sql, params);
  const client = await pool.connect();
  try {
    await client.query(pgSql, pgParams);
  } finally {
    client.release();
  }
}

async function pgGet(sql, params = []) {
  const { sql: pgSql, params: pgParams } = toPg(sql, params);
  const client = await pool.connect();
  try {
    const result = await client.query(pgSql, pgParams);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function pgAll(sql, params = []) {
  const { sql: pgSql, params: pgParams } = toPg(sql, params);
  const client = await pool.connect();
  try {
    const result = await client.query(pgSql, pgParams);
    return result.rows || [];
  } finally {
    client.release();
  }
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
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function localAll(sql, params = []) {
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

// ── Public API (async) ────────────────────────────────────────

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

function getDbSave() {
  return saveDb;
}

// ── Initialization ─────────────────────────────────────────────

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // ── Supabase / PostgreSQL mode ──
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    isSupabase = true;
    console.log('✅ Connected to Supabase PostgreSQL');

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        section_key TEXT UNIQUE NOT NULL,
        title TEXT,
        subtitle TEXT,
        content TEXT,
        image_url TEXT,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        technologies TEXT,
        image_url TEXT,
        project_url TEXT,
        is_featured INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'technical',
        proficiency INTEGER DEFAULT 50,
        icon TEXT,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        client_name TEXT NOT NULL,
        client_title TEXT,
        client_image TEXT,
        content TEXT,
        rating INTEGER DEFAULT 5,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS style_settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type TEXT DEFAULT 'color',
        category TEXT DEFAULT 'colors',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS site_config (
        id SERIAL PRIMARY KEY,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        page_url TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed default admin user if not exists
    const bcrypt = require('bcryptjs');
    const existingUser = await pgGet('SELECT id FROM users WHERE username = $1', ['admin']);
    if (!existingUser) {
      const hash = bcrypt.hashSync('admin123', 10);
      await pgRun('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', ['admin', hash, 'admin']);
      console.log('✅ Default admin user created (admin / admin123)');
    }

    // Seed default config
    const defaultEducation = JSON.stringify([
      { title: 'Bachelor of Arts (Education) in Islamic Studies', institution: 'University of Ilorin', description: 'Studied Islamic Studies Education with a focus on Islamic scholarship, educational methodology, teaching practices, and the effective transmission of Islamic knowledge.' },
      { title: "I'dādiyyah & Thānawiyyah Certificates", institution: "Dārul-'Ulūm Isalekoto", description: "Completed structured studies in Islamic sciences and Arabic language at both the I'dādiyyah and Thānawiyyah levels." },
      { title: "Qur'anic Memorization & Tajwid", institution: "Dārul-'Ulūm Isalekoto", description: "Completed Qur'anic memorization alongside structured Tajwid training." },
      { title: 'Desktop Publishing & Programming', institution: 'Self-taught', description: 'Developed practical skills in desktop publishing and programming through self-directed study.' }
    ]);
    const defaultCompetencies = JSON.stringify([
      { name: 'Islamic Studies', icon: 'mosque' },
      { name: "Qur'anic Memorization", icon: 'menu_book' },
      { name: 'Tajwid', icon: 'record_voice_over' },
      { name: 'Arabic Language', icon: 'translate' },
      { name: 'EdTech', icon: 'school' },
      { name: 'UI/UX Design', icon: 'design_services' },
      { name: 'Digital Learning', icon: 'devices' }
    ]);

    async function ensureConfig(key, value) {
      const existing = await pgGet('SELECT config_key FROM site_config WHERE config_key = $1', [key]);
      if (!existing) {
        await pgRun('INSERT INTO site_config (config_key, config_value) VALUES ($1, $2)', [key, value]);
      }
    }
    await ensureConfig('education_items', defaultEducation);
    await ensureConfig('core_competencies', defaultCompetencies);

  } else {
    // ── Local sql.js mode ──
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
    try {
      const res = db.exec("PRAGMA table_info(testimonials)");
      const cols = res.length ? res[0].values : [];
      if (!cols.some(row => row[1] === 'sort_order')) {
        db.run("ALTER TABLE testimonials ADD COLUMN sort_order INTEGER DEFAULT 0");
        saveDb();
      }
    } catch (e) { /* ignore */ }

    // Seed default config
    const defaultEducation = JSON.stringify([
      { title: 'Bachelor of Arts (Education) in Islamic Studies', institution: 'University of Ilorin', description: 'Studied Islamic Studies Education with a focus on Islamic scholarship, educational methodology, teaching practices, and the effective transmission of Islamic knowledge.' },
      { title: "I'dādiyyah & Thānawiyyah Certificates", institution: "Dārul-'Ulūm Isalekoto", description: "Completed structured studies in Islamic sciences and Arabic language at both the I'dādiyyah and Thānawiyyah levels." },
      { title: "Qur'anic Memorization & Tajwid", institution: "Dārul-'Ulūm Isalekoto", description: "Completed Qur'anic memorization alongside structured Tajwid training." },
      { title: 'Desktop Publishing & Programming', institution: 'Self-taught', description: 'Developed practical skills in desktop publishing and programming through self-directed study.' }
    ]);
    const defaultCompetencies = JSON.stringify([
      { name: 'Islamic Studies', icon: 'mosque' },
      { name: "Qur'anic Memorization", icon: 'menu_book' },
      { name: 'Tajwid', icon: 'record_voice_over' },
      { name: 'Arabic Language', icon: 'translate' },
      { name: 'EdTech', icon: 'school' },
      { name: 'UI/UX Design', icon: 'design_services' },
      { name: 'Digital Learning', icon: 'devices' }
    ]);

    function ensureConfig(key, value) {
      const existing = localGet('SELECT config_key FROM site_config WHERE config_key = ?', [key]);
      if (!existing) {
        localRun('INSERT INTO site_config (config_key, config_value) VALUES (?, ?)', [key, value]);
      }
    }
    ensureConfig('education_items', defaultEducation);
    ensureConfig('core_competencies', defaultCompetencies);

    console.log('✅ Local SQLite database ready');
  }
}

module.exports = { initDatabase, dbRun, dbGet, dbAll, getDbSave };
