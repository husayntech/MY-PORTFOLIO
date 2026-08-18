# Sulyman Abdulrafiu Kehinde - Portfolio Website

A professional, modern, and responsive portfolio website for Sulyman Abdulrafiu Kehinde, an Islamic educator, Arabic language specialist, curriculum developer, and web designer.

## Features

### Frontend
- **Responsive Design** - Works on all devices (desktop, tablet, mobile)
- **Islamic-Inspired Design** - Green and gold color palette with geometric patterns
- **Glassmorphism Effects** - Modern frosted glass UI elements
- **Smooth Animations** - Fade-in effects, hover animations, and transitions
- **Style Editor** - Live customization panel for colors, fonts, and layout
- **Dark Mode** - Toggle between light and dark themes
- **Mobile Navigation** - Bottom navigation bar for mobile users

### Backend & Admin
- **SQLite Database** - Lightweight, serverless database
- **Admin Dashboard** - Full content management system
- **Analytics Tracking** - Page views and contact form submissions
- **Contact Form** - With validation and email storage
- **Style Management** - Customize portfolio appearance from admin

### Sections
- Hero Section with typing effect
- About Me with mission statement
- Education Timeline
- Skills & Expertise with animated progress bars
- Featured Projects showcase
- Teaching Philosophy
- Services grid
- Testimonials carousel
- Contact Form with map placeholder

## Tech Stack

- **Frontend:** HTML5, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via better-sqlite3)
- **Authentication:** Express Session + bcrypt

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sulyman-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Portfolio: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Style Editor: http://localhost:3000/editor (accessible via button on portfolio)

## Default Credentials

- **Username:** admin
- **Password:** admin123

> ⚠️ **Important:** Change these credentials in production!

## Project Structure

```
sulyman-portfolio/
├── data/
│   └── portfolio.db          # SQLite database
├── public/
│   ├── index.html            # Main portfolio page
│   └── admin.html            # Admin dashboard
├── scripts/
│   └── init-db.js            # Database initialization
├── server.js                 # Express server
├── package.json
├── .env                      # Environment variables
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status

### Content
- `GET /api/sections` - Get all sections
- `PUT /api/sections/:key` - Update section

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Testimonials
- `GET /api/testimonials` - Get all testimonials
- `POST /api/testimonials` - Create testimonial
- `PUT /api/testimonials/:id` - Update testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial

### Contacts
- `GET /api/contacts` - Get all messages (admin)
- `POST /api/contacts` - Submit contact form
- `PUT /api/contacts/:id/read` - Mark as read
- `DELETE /api/contacts/:id` - Delete message

### Styles
- `GET /api/styles` - Get all style settings
- `PUT /api/styles` - Update styles

### Analytics
- `GET /api/analytics` - Get analytics data
- `POST /api/analytics` - Track event

## Customization

### Changing Colors
1. Click the palette icon on the right side of the portfolio
2. Adjust colors using the color pickers
3. Click "Save Changes"

### Via Admin Dashboard
1. Go to `/admin`
2. Login with credentials
3. Navigate to "Styles" section
4. Customize colors, fonts, layout, and theme

## Development

### Development Mode
```bash
npm run dev
```

### Database Reset
```bash
npm run init-db
```

## License

This project is proprietary software. All rights reserved.

## Contact

For inquiries about this portfolio or collaboration opportunities:
- Email: contact@sulymanak.com
- Location: London, UK