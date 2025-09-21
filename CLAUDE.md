# CLAUDE.md - PMP Progress Tracker Project Context

## Quick Links
- **Live App**: https://pmp-progress-tracker.vercel.app
- **GitHub**: https://github.com/kousen/pmp-progress-tracker
- **Vercel Dashboard**: https://vercel.com/dashboard

## Project Overview
This is a web application for tracking student progress through a PMP certification Udemy course. It was built for CPSC 403 Senior Seminar at Trinity College, where 9 students are working through the course from now until the end of October 2025.

## Key Features Implemented
1. **Three-tier authentication system**:
   - Admin (password stored securely) - Can edit all progress, add students
   - Students (access codes like `ALI1234`) - Can edit only their own progress
   - Viewers - Can view all progress without editing

2. **Dual database support**:
   - SQLite for local development (automatic)
   - PostgreSQL for Vercel deployment (persistent)

3. **Student self-service**: Students can update their own progress using access codes

## Technical Stack
- **Framework**: Next.js 15.5.3 with TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (local) / Neon PostgreSQL (Vercel)
- **Authentication**: bcryptjs for password hashing
- **Deployment**: Vercel with GitHub auto-deploy
- **Package Manager**: npm
- **Node Version**: 18+

## Important Files
- `lib/db-unified.ts` - Database abstraction layer (auto-selects SQLite or PostgreSQL)
- `app/components/ProgressGrid.tsx` - Main progress tracking grid
- `app/components/LoginForm.tsx` - Three-mode login interface
- `app/api/` - All API routes for students, modules, progress, and auth
- `pmp-tracker.http` - HTTP Client requests for WebStorm/IntelliJ
- `.gitignore` - Includes .claude/, *.db, .env files

## Database Schema
- `students` - Student info with access codes
- `course_modules` - 14 PMP course modules
- `progress` - Progress tracking (student × module)
- `exam_status` - Exam scheduling and results

## Default Data
- Admin password: Stored securely in the application
- 14 course modules are auto-seeded on first run
- Access codes are generated as: First 3 letters of name + 4 random digits

## Deployment Notes
- **Local**: Uses SQLite, no setup needed
- **Vercel**: Uses Neon Serverless Postgres (free tier)
- Database auto-detects based on presence of `POSTGRES_URL` environment variable
- GitHub pushes to main branch auto-deploy to production
- Pull requests create preview deployments

## Security Considerations
- All database files are gitignored
- Access codes are unique per student
- Students can only edit their own progress
- Admin password should be changed for production use

## User Workflows

### Admin Workflow
1. Login with admin password
2. Click "Seed 9 Students" or add individually
3. Share access codes with students
4. Monitor and edit any student's progress

### Student Workflow
1. Receive access code from admin
2. Login with access code
3. See their row highlighted in green
4. Click percentages in their row to update
5. Cannot edit other students' data

### Viewer Workflow
1. Click "View Only" (no login)
2. See all progress
3. Cannot make edits

## Common Tasks

### Adding New Students
```javascript
// In AdminPanel, students are added with auto-generated access codes
// Format: First 3 letters + 4 digits (e.g., "ALI1234")
```

### Changing Admin Password
```javascript
// Update the admin password hash in lib/auth.ts
```

### Resetting Database
```bash
# Delete local SQLite database
rm pmp-tracker.db

# For Vercel Postgres, run in Query tab:
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS students CASCADE;
# Tables recreate on next visit
```

## Known Limitations
1. SQLite database resets if file is deleted
2. Access codes are shown only when students are created (not stored visibly afterward)
3. No password reset functionality for students
4. No email notifications

## Future Enhancements (Not Implemented)
- Email students their access codes
- Export progress to CSV/PDF
- Progress history/timeline
- Bulk import students from CSV
- Password reset functionality
- More detailed progress metrics

## Development Workflow

### Running Locally
```bash
npm run dev
# Visit http://localhost:3000
# Database creates automatically
```

### Committing Changes
```bash
git add -A
git commit -m "Your commit message"
git push origin main
# Vercel auto-deploys in ~1 minute
```

### API Testing
```bash
# Get all students
curl https://pmp-progress-tracker.vercel.app/api/students

# Add a student
curl -X POST https://pmp-progress-tracker.vercel.app/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Student Name"}'
```

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Database not persisting (local)
- Check if `pmp-tracker.db` exists
- Ensure write permissions in directory

### Database not connecting (Vercel)
- Check environment variables in Vercel dashboard
- Ensure Postgres database is connected to project
- Redeploy after connecting database

## Recent Issues & Solutions

### Students Not Displaying (FIXED)
- **Issue**: Students disappeared after login/logout
- **Cause**: Overly cautious database connection check
- **Solution**: Removed `ensureConnection()` check, added `cache: 'no-store'` to fetches

### Scrolling Issue (FIXED)
- **Issue**: Only 2-3 students visible without scrolling
- **Solution**: Changed from `overflow-hidden` to `overflow-auto max-h-[80vh]`

### Deployment Errors (FIXED)
- **Issue**: ESLint errors blocking Vercel deployment
- **Solution**: Relaxed ESLint rules, fixed variable naming conflicts

## Student Access

Students have been provided with individual access codes. Access codes are stored securely in the database and should be distributed privately to each student.

## Contact
Built for CPSC 403 Senior Seminar, Trinity College
Instructor: Ken Kousen
Timeline: September - October 2025
Purpose: Track 9 students through PMP certification prep

---
*Last updated: September 21, 2025*

## Next Steps / TODOs
- [ ] Consider adding email notifications for progress milestones
- [ ] Add export to CSV/PDF functionality
- [ ] Implement progress history/timeline view
- [ ] Add batch progress update capability
- [ ] Consider adding dark mode toggle