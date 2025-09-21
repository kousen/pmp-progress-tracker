# Quick Start Guide

## Moving to New Location

When you move this project to its own repository:

```bash
# 1. Copy the entire pmp-progress-tracker folder to your desired location
cp -r pmp-progress-tracker ~/Desktop/pmp-progress-tracker

# 2. Navigate to the new location
cd ~/Desktop/pmp-progress-tracker

# 3. Initialize git repository
git init
git add .
git commit -m "Initial commit: PMP Progress Tracker"

# 4. Create GitHub repository and push
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/pmp-progress-tracker.git
git branch -M main
git push -u origin main
```

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Visit http://localhost:3000
```

## Deploy to Vercel

```bash
# Option 1: Via GitHub (Recommended)
# - Push to GitHub
# - Import to Vercel
# - Add Postgres database

# Option 2: Direct deploy
npx vercel

# Follow prompts, then add database in dashboard
```

## Test Credentials

- **Admin**: Use the configured admin password
- **Students**: Will get access codes like `ALI1234` after creation
- **Viewers**: No login needed

## Key Files to Check

1. **README.md** - Full documentation
2. **CLAUDE.md** - Technical context for AI assistants
3. **VERCEL_DATABASE_SETUP.md** - Database setup guide
4. **.env.example** - Environment variables template
5. **.gitignore** - Ensures no sensitive data in repo

## Database Note

- **Local**: SQLite works automatically
- **Production**: Must add Vercel Postgres for data persistence

## Support Files

All documentation is in place for:
- Setting up the project
- Deploying to Vercel
- Understanding the codebase
- Managing students and progress

The project is ready to be moved and deployed!