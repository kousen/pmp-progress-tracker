# PMP Progress Tracker

A web application for tracking student progress through the PMP (Project Management Professional) certification Udemy course. Built for CPSC 403 Senior Seminar at Trinity College.

## Features

### Three User Modes
1. **Student Login** - Students use access codes to update their own progress
2. **Admin Login** - Full management capabilities for all students
3. **View Only** - Public view of all student progress (no editing)

### Key Capabilities
- 📊 **Progress Grid** - Visual tracking of 9 students × 14 course modules
- 🔐 **Student Self-Service** - Students update their own progress with access codes
- 👤 **Admin Management** - Add/remove students, view access codes, edit all progress
- 💾 **Dual Database Support** - SQLite (local) and PostgreSQL (production)
- 🚀 **Vercel Ready** - One-click deployment with persistent database

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/kousen/pmp-progress-tracker.git
cd pmp-progress-tracker

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Default Credentials
- **Admin Password**: Configured in the application
- **Student Access Codes**: Generated automatically and distributed privately

## API Access

### REST API Endpoints
The application provides a REST API for programmatic access:

- `GET /api/students` - Get all students
- `POST /api/students` - Add a new student
- `GET /api/modules` - Get course modules
- `GET /api/progress` - Get all progress records
- `POST /api/progress` - Update progress
- `POST /api/auth/login` - Authentication

See `pmp-tracker.http` file for WebStorm HTTP Client examples.

## Deployment to Vercel (Recommended)

### Option 1: Deploy via GitHub (Easiest)
1. Push this code to GitHub
2. Import to Vercel from GitHub
3. Add Vercel Postgres database (see below)
4. Deploy!

### Option 2: Deploy via CLI
```bash
npm i -g vercel
vercel
```

### Adding Persistent Database (Required for Production)
1. In Vercel Dashboard → Storage → Create Database → Neon (Serverless Postgres)
2. Connect to your project
3. Done! Database auto-configures with all necessary environment variables

See [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md) for detailed instructions.

## Project Structure

```
pmp-progress-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── students/     # Student management
│   │   ├── modules/      # Course modules
│   │   └── progress/     # Progress tracking
│   ├── components/       # React components
│   │   ├── LoginForm.tsx
│   │   ├── ProgressGrid.tsx
│   │   └── AdminPanel.tsx
│   └── page.tsx          # Main application page
├── lib/                   # Backend utilities
│   ├── db.ts             # SQLite database
│   ├── db-postgres.ts    # PostgreSQL database
│   ├── db-unified.ts     # Database abstraction
│   └── auth.ts           # Authentication logic
├── public/               # Static assets
└── package.json          # Dependencies

```

## User Guide

### For Administrators
1. Login with password `trinity403`
2. Add students individually or use "Seed 9 Students"
3. Access codes are displayed after adding students
4. Click any progress percentage to edit
5. All changes save automatically

### For Students
1. Get your access code from the administrator
2. Login with your access code (e.g., `ALI1234`)
3. Your row will be highlighted in green
4. Click percentages in your row to update progress
5. Cannot edit other students' progress

### For Viewers
1. Click "View Only" - no login required
2. See all student progress
3. Cannot make any edits

## Database Configuration

### Local Development (SQLite)
- Automatic - no configuration needed
- Database file: `pmp-tracker.db`
- Data stored locally

### Production (PostgreSQL)
- Uses Vercel Postgres when `POSTGRES_URL` is set
- Automatic table creation on first run
- Persistent data storage

### Environment Variables
Copy `.env.example` to `.env.local` for local development:
```bash
cp .env.example .env.local
```

## Live Production

🔗 **Live URL**: https://pmp-progress-tracker.vercel.app

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (local) / Neon PostgreSQL (production)
- **Authentication**: bcryptjs for password hashing
- **Deployment**: Vercel

## Course Structure

The tracker covers 14 PMP course modules:
1. Introduction & Overview
2. Project Management Fundamentals
3. Integration Management
4. Scope Management
5. Schedule Management
6. Cost Management
7. Quality Management
8. Resource Management
9. Communications Management
10. Risk Management
11. Procurement Management
12. Stakeholder Management
13. Agile & Hybrid Approaches
14. Practice Tests & Exam Prep

## Security Notes

- Admin password should be changed in production (update `lib/auth.ts`)
- Access codes are auto-generated and unique
- Database credentials stored in environment variables
- Student data never committed to repository

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) file

## Support

- **Course**: [Ultimate Project Management PMP 35 PDUs](https://www.udemy.com/course/ultimate-project-management-pmp-35-pdus/)
- **Certification**: [PMI CAPM](https://www.pmi.org/certifications/certified-associate-capm)
- **Deployment**: [Vercel Documentation](https://vercel.com/docs)

## Current Students (Fall 2025)

9 students currently enrolled:
- Agyapong
- Anjum
- Bizualem
- Carpe Elias
- Dwivedi
- Geleta
- Hwang
- Osarfo-Akoto
- Sanchez

## Acknowledgments

Built for CPSC 403 Senior Seminar at Trinity College to track student progress through PMP certification training (Fall 2025).

---

**Note**: This project uses a SQLite database locally that resets when redeployed. For persistent storage, deploy to Vercel with PostgreSQL (free tier available).