# PMP Progress Tracker - Deployment Guide

## Overview
A simple web app to track student progress through the PMP certification Udemy course.

## Features
- Progress grid showing 9 students × 14 course modules
- Admin mode for editing progress (password configured in application)
- View-only mode for students
- Automatic progress calculations
- SQLite database (local file)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deploying to Vercel (FREE)

### Option 1: Deploy via GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js - just click "Deploy"
6. Your app will be live at `https://your-app-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# In the project directory, run:
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? pmp-progress-tracker
# - In which directory? ./
# - Want to override settings? No
```

## Important Notes

### Database Storage
- In development: SQLite file stored locally
- In production (Vercel): SQLite file stored in `/tmp` (temporary)
- **Note**: Data will reset when the serverless function cold starts
- For persistent storage, consider upgrading to:
  - Vercel Postgres (free tier available)
  - Supabase (free tier)
  - PlanetScale (free tier)

### Authentication
- Admin password is configured in the application
- To change it, modify `/lib/auth.ts` before deploying
- Consider using environment variables for production

### Custom Domain (Optional)
- You can add a custom domain in Vercel dashboard
- Go to Settings → Domains
- Add your domain and follow DNS instructions

## Environment Variables (Optional)
If you want to use environment variables:

1. In Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `ADMIN_PASSWORD` - for admin authentication
   - `DATABASE_URL` - if using external database

## Monitoring
- Vercel provides free analytics and logs
- Check the Functions tab in Vercel dashboard for API logs
- Monitor usage to ensure you stay within free tier limits

## Free Tier Limits (Vercel Hobby Plan)
- Unlimited personal projects
- 100GB bandwidth/month (more than enough)
- Serverless function execution: 100GB-hours/month
- No credit card required

## Support
- The app is simple enough that it should "just work"
- Check Vercel docs at https://vercel.com/docs
- For issues, check the Functions logs in Vercel dashboard