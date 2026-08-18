const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'portfolio.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initDatabase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      title TEXT,
      subtitle TEXT,
      content TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      technologies TEXT,
      image_url TEXT,
      project_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      proficiency INTEGER DEFAULT 0,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      client_title TEXT,
      client_image TEXT,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      sort_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS style_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      setting_type TEXT DEFAULT 'color',
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      page_url TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
    ['admin', hashedPassword, 'admin@sulymanak.com', 'admin']);

  // Insert default sections
  const sections = [
    ['hero', 'Bridging Islamic Scholarship, Arabic Excellence, and Modern Educational Innovation.', 'I am an Islamic educator, Arabic language specialist, curriculum developer, and web designer dedicated to building educational experiences that preserve authentic Islamic tradition while embracing modern technology.', '', '', 1],
    ['about', 'About Me', '', 'I am Sulyman Abdulrafiu Kehinde, an Islamic educator, Qur\'anic memorization and Tajwid instructor, Arabic language specialist, curriculum developer, web designer, and educational technology enthusiast. My academic and professional journey spans Islamic sciences, Arabic and Qur\'anic education, teaching, curriculum development, and digital design. I am committed to continuous learning and to developing expertise that enables me to contribute meaningfully to both Islamic education and the wider educational landscape.', '', 2],
    ['education', 'Education', 'Academic Foundation', '', '', 3],
    ['skills', 'Areas of Expertise', 'Bridging Traditional Islamic Sciences with Modern Digital Innovation', '', '', 4],
    ['projects', 'Featured Projects', 'A synthesis of academic rigor and creative digital mastery', '', '', 5],
    ['philosophy', 'Teaching Philosophy', '', '"My teaching philosophy combines authentic Islamic scholarship with engaging modern instructional methods. I believe education should nurture knowledge, character, leadership, and lifelong learning while remaining rooted in the Qur\'an and Sunnah."', '', 6],
    ['services', 'Services', 'Comprehensive Solutions for Educational Excellence', '', '', 7],
    ['experience', 'Experience', 'Professional Journey', '', '', 8],
    ['testimonials', 'Testimonials', 'What Others Say', '', '', 9],
    ['contact', 'Contact', "Let's Connect", '', '', 10]
  ];

  sections.forEach(s => {
    db.run(`INSERT OR IGNORE INTO sections (section_key, title, subtitle, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)`, s);
  });

  // Insert default projects
  const projects = [
    ['Al Mustafa Academy Website', 'Designed and developed a modern website for an Islamic academy featuring admissions, curriculum, branding, Arabic content, and a professional user experience.', 'React,Node.js,Tailwind CSS,Responsive Design', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', '', 1, 1],
    ['Arabic Sarf Textbook', 'Authored a beginner-friendly Arabic morphology textbook for Idadiyyah students, focusing on simplified explanations, organized lessons, and practical examples.', 'InDesign,Typography,Layout Design', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', '', 2, 1],
    ['Islamic Curriculum Development', 'Designed structured educational content for Islamic schools integrating Qur\'anic studies, Arabic language, character development, and modern educational standards.', 'Instructional Design,Pedagogy,Curriculum Planning', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', '', 3, 1],
    ['Arabic Educational Resources', 'Produced educational materials covering Arabic grammar, morphology, classroom resources, and student learning guides.', 'Content Development,Arabic Language,Education', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', '', 4, 1]
  ];

  projects.forEach(p => {
    db.run(`INSERT OR IGNORE INTO projects (title, description, technologies, image_url, project_url, sort_order, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)`, p);
  });

  // Insert default skills
  const skills = [
    ['HTML/CSS', 'technical', 95, 'code', 1],
    ['JavaScript/TypeScript', 'technical', 85, 'code', 2],
    ['React/Next.js', 'technical', 80, 'code', 3],
    ['Tailwind CSS', 'technical', 90, 'code', 4],
    ['Node.js', 'technical', 70, 'code', 5],
    ['Figma', 'technical', 85, 'design_services', 6],
    ['Git', 'technical', 80, 'code', 7],
    ['Responsive Design', 'technical', 90, 'devices', 8],
    ['Qur\'anic Memorization', 'islamic', 95, 'menu_book', 1],
    ['Tajwid', 'islamic', 90, 'menu_book', 2],
    ['Arabic Grammar (Nahw)', 'islamic', 90, 'menu_book', 3],
    ['Arabic Morphology (Sarf)', 'islamic', 85, 'menu_book', 4],
    ['Islamic Jurisprudence', 'islamic', 80, 'menu_book', 5],
    ['Curriculum Planning', 'islamic', 85, 'school', 6],
    ['Student Mentorship', 'islamic', 90, 'people', 7]
  ];

  skills.forEach(s => {
    db.run(`INSERT OR IGNORE INTO skills (name, category, proficiency, icon, sort_order) VALUES (?, ?, ?, ?, ?)`, s);
  });

  // Insert default services
  const services = [
    ['Website Design', 'Modern, responsive websites tailored for educational and academic institutions.', 'language', 1],
    ['Islamic School Branding', 'Creating cohesive visual identities that reflect academic excellence and tradition.', 'school', 2],
    ['Curriculum Development', 'Structuring educational materials for clarity, engagement, and effective learning.', 'library_books', 3],
    ['Arabic Language Instruction', 'Expert guidance in Arabic language sciences and traditional texts.', 'translate', 4],
    ['Islamic Studies Teaching', 'Comprehensive instruction in Islamic sciences and Qur\'anic studies.', 'mosque', 5],
    ['Educational Consulting', 'Strategic guidance for educational institutions seeking innovation.', 'psychology', 6],
    ['Digital Content Creation', 'Producing engaging digital learning materials and resources.', 'devices', 7],
    ['Academic Resource Development', 'Creating comprehensive academic materials and study guides.', 'auto_stories', 8]
  ];

  services.forEach(s => {
    db.run(`INSERT OR IGNORE INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)`, s);
  });

  // Insert default testimonials
  const testimonials = [
    ['Dr. Amina Rahman', 'Director, Al Mustafa Academy', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Professional, knowledgeable, and dedicated to educational excellence. The digital presence created for our academy perfectly balances tradition with modern accessibility.', 5],
    ['Shaykh Tariq Mahmud', 'Head of Arabic Studies', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Outstanding Arabic instructor and curriculum developer. The structuring of the Arabic Sarf materials was transformative for our students.', 5],
    ['Malik Abdullahi', 'School Administrator', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Excellent web designer with a deep understanding of Islamic education. Highly recommended for any educational institution.', 5]
  ];

  testimonials.forEach(t => {
    db.run(`INSERT OR IGNORE INTO testimonials (client_name, client_title, client_image, content, rating) VALUES (?, ?, ?, ?, ?)`, t);
  });

  // Insert default style settings
  const styles = [
    ['primary_color', '#3C1B69', 'color', 'colors'],
    ['primary_dark', '#2A1350', 'color', 'colors'],
    ['gold_color', '#C9A96E', 'color', 'colors'],
    ['gold_dark', '#B8963F', 'color', 'colors'],
    ['background_color', '#3C1B69', 'color', 'colors'],
    ['card_color', '#FFFFFF', 'color', 'colors'],
    ['text_color', '#11071F', 'color', 'colors'],
    ['hero_title_color', '#FFFFFF', 'color', 'colors'],
    ['hero_accent_color', '#C9A96E', 'color', 'colors'],
    ['accent_color', '#F5EDE3', 'color', 'colors'],
    ['heading_font', 'Playfair Display', 'font', 'typography'],
    ['body_font', 'Inter', 'font', 'typography'],
    ['base_font_size', '16', 'number', 'typography'],
    ['container_width', '1200', 'number', 'layout'],
    ['section_padding', '120', 'number', 'layout'],
    ['card_border_radius', '12', 'number', 'layout'],
    ['enable_animations', 'true', 'boolean', 'animations'],
    ['animation_speed', '0.3', 'number', 'animations'],
    ['dark_mode', 'false', 'boolean', 'theme'],
    ['language', 'en', 'string', 'language']
  ];

  styles.forEach(s => {
    db.run(`INSERT OR IGNORE INTO style_settings (setting_key, setting_value, setting_type, category) VALUES (?, ?, ?, ?)`, s);
  });

  // Insert site configuration
  const configs = [
    ['site_title', 'Sulyman Abdulrafiu Kehinde - Portfolio', 'Website title'],
    ['site_description', 'Islamic educator, Arabic language specialist, curriculum developer, and web designer', 'Website meta description'],
    ['contact_email', 'contact@sulymanak.com', 'Contact email address'],
    ['phone_number', '', 'Phone number'],
    ['location', 'London, UK', 'Location'],
    ['linkedin_url', '', 'LinkedIn profile URL'],
    ['github_url', '', 'GitHub profile URL'],
    ['cv_file_path', '/files/cv.pdf', 'Path to CV file'],
    // Landing page content (editable from the style editor)
    ['hero_badge', 'Educator & Designer', 'Hero badge text'],
    ['hero_title', 'Bridging Islamic Scholarship, Arabic Excellence, and Modern Educational Innovation', 'Hero headline'],
    ['hero_title_accent', 'Modern Educational Innovation', 'Highlighted part of hero headline'],
    ['hero_typing', 'I blend traditional rigor with digital craftsmanship.', 'Hero typing subtitle'],
    ['btn_projects', 'View Projects', 'Hero button label'],
    ['btn_cv', 'Download CV', 'Download CV button label'],
    ['stat_experience', '10+ Years Experience', 'Hero stat 1'],
    ['stat_islamic', 'Islamic Sciences', 'Hero stat 2'],
    ['about_section_title', 'Who I Am', 'About page title'],
    ['about_title', 'Education', 'Education block title'],
    ['about_text_1', 'I am Sulyman Abdulrafiu Kehinde, an Islamic educator, Qur\'anic memorization and Tajwid instructor, Arabic language specialist, curriculum developer, web designer, and educational technology enthusiast. My academic and professional journey spans Islamic sciences, Arabic and Qur\'anic education, teaching, curriculum development, and digital design. I am committed to continuous learning and to developing expertise that enables me to contribute meaningfully to both Islamic education and the wider educational landscape.', 'About section text'],
    ['approach_title', 'Professional Approach', 'Professional approach heading'],
    ['approach_text', 'With a foundation in Islamic sciences and education, complemented by modern web technologies and digital design, I approach educational challenges from both a scholarly and technological perspective. I seek to translate educational needs into practical solutions—whether through curriculum development, instructional resources, digital platforms, or engaging learning experiences.', 'Professional approach text'],
    ['mission_title', 'Mission', 'Mission heading'],
    ['mission_text', 'My mission is to empower educational institutions and individuals with meaningful, effective, and sustainable learning solutions. I aim to preserve the richness of Islamic knowledge while improving how it is taught, organized, and accessed through sound pedagogy, thoughtful curriculum design, and purposeful use of technology. Through this work, I hope to contribute to an educational future where authentic knowledge and modern innovation complement one another.', 'Mission text'],
    ['education_title', 'Education', 'Education section title'],
    ['education_subtitle', 'Academic foundation in Islamic Sciences and Modern Education', 'Education section subtitle'],
    ['skills_title', 'Skills & Expertise', 'Skills section title'],
    ['skills_subtitle', 'Bridging traditional Islamic sciences with modern digital innovation', 'Skills section subtitle'],
    ['skills_technical', 'Technical Arsenal', 'Technical skills heading'],
    ['skills_islamic', 'Islamic Sciences', 'Islamic sciences heading'],
    ['skills_competencies', 'Core Competencies', 'Core competencies heading'],
    ['projects_title', 'Featured Projects', 'Projects section title'],
    ['projects_subtitle', 'A synthesis of academic rigor and creative digital mastery', 'Projects section subtitle'],
    ['btn_projects_all', 'View All Projects', 'View all projects button label'],
    ['philosophy_title', 'Teaching Philosophy', 'Philosophy section title'],
    ['philosophy_quote', '"My teaching philosophy combines authentic Islamic scholarship with engaging modern instructional methods. I believe education should nurture knowledge, character, leadership, and lifelong learning while remaining rooted in the Qur\'an and Sunnah."', 'Philosophy quote'],
    ['services_title', 'Services', 'Services section title'],
    ['services_subtitle', 'Comprehensive solutions for educational excellence', 'Services section subtitle'],
    ['testimonials_title', 'Testimonials', 'Testimonials section title'],
    ['testimonials_subtitle', 'What others say about working with me', 'Testimonials section subtitle'],
    ['contact_title', "Let's Connect", 'Contact section title'],
    ['contact_subtitle', "Whether you're seeking a modern digital presence, academic collaboration, or insightful discourse, I invite you to reach out.", 'Contact section subtitle'],
    ['contact_info_title', 'Contact Information', 'Contact info heading'],
    ['contact_email', 'contact@sulymanak.com', 'Contact email address'],
    ['contact_location', 'Available Worldwide', 'Contact location'],
    ['contact_location_sub', 'Based in London, UK', 'Contact location detail'],
    ['footer_copyright', '© 2024 Sulyman Abdulrafiu Kehinde. All rights reserved.', 'Footer copyright text'],
    ['hero_badges', JSON.stringify([
        { icon: 'school', title: 'Educator', subtitle: 'Islamic Studies', pos: '-right-6 top-12' },
        { icon: 'code', title: 'Developer', subtitle: 'Web Design', pos: '-left-6 bottom-24' },
        { icon: 'translate', title: 'Arabic', subtitle: 'Language Specialist', pos: '-right-2 bottom-4' }
    ]), 'Hero floating badges (JSON: icon, title, subtitle, pos)'],
    ['education_items', JSON.stringify([
        { title: 'Bachelor of Arts (Education) in Islamic Studies', institution: 'University of Ilorin', description: 'Studied Islamic Studies Education with a focus on Islamic scholarship, educational methodology, teaching practices, and the effective transmission of Islamic knowledge. Developed a strong foundation in Islamic sciences alongside modern approaches to education.' },
        { title: "I'dādiyyah & Thānawiyyah Certificates", institution: "Dārul-'Ulūm Isalekoto", description: "Completed structured studies in Islamic sciences and Arabic language at both the I'dādiyyah and Thānawiyyah levels, developing a foundation in Arabic, Islamic jurisprudence, theology, and classical Islamic disciplines." },
        { title: "Qur'anic Memorization & Tajwid", institution: "Dārul-'Ulūm Isalekoto", description: "Completed Qur'anic memorization alongside structured Tajwid training — mastering the rules of recitation, articulation points, and the qualities of letters — building a strong foundation in accurate recitation with continued review to preserve it." },
        { title: 'Desktop Publishing & Programming', institution: 'Self-taught', description: 'Developed practical skills in desktop publishing — layout design, typography, and print-ready document production — alongside programming and modern web technologies through self-directed study, applied to creating educational materials and digital platforms.' }
    ]), 'Education timeline items (JSON: title, institution, description)'],
    ['core_competencies', JSON.stringify([
        { name: 'Islamic Studies', icon: 'mosque' },
        { name: "Qur'anic Memorization", icon: 'menu_book' },
        { name: 'Tajwid', icon: 'record_voice_over' },
        { name: 'Arabic Language', icon: 'translate' },
        { name: 'EdTech', icon: 'school' },
        { name: 'UI/UX Design', icon: 'design_services' },
        { name: 'Digital Learning', icon: 'devices' }
    ]), 'Core competencies (JSON: name, icon)'],
    ['custom_styles', '{}', 'Per-element custom CSS rules (JSON: selector → props)']
  ];

  configs.forEach(c => {
    db.run(`INSERT OR IGNORE INTO site_config (config_key, config_value, description) VALUES (?, ?, ?)`, c);
  });

  // Save the database
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);

  console.log('✅ Database initialized successfully!');
  console.log('📁 Database location:', DB_PATH);
  console.log('👤 Default admin credentials: admin / admin123');

  db.close();
}

initDatabase().catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});