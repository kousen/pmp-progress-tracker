# Setting Up Vercel Postgres for PMP Tracker

## Why Vercel Postgres?
- **FREE** for your needs (60 compute hours/month, 256MB storage)
- **Persistent** - Data survives through October and beyond
- **Automatic backups**
- **Zero configuration** - Works instantly with Vercel

## Setup Steps (5 minutes)

### 1. Deploy to Vercel First
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy from this directory
vercel

# Follow prompts, or push to GitHub and import
```

### 2. Create PostgreSQL Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `pmp-progress-tracker` project
3. Click the **Storage** tab
4. Click **Create Database**
5. Choose **Postgres** (Powered by Neon)
6. Select your region (us-east-1 recommended)
7. Click **Create**

### 3. Connect Database to Project

1. After creation, Vercel asks "Connect to a Project?"
2. Select your `pmp-progress-tracker` project
3. Choose **All Environments** (or just Production)
4. Click **Connect**

**That's it!** Vercel automatically adds all environment variables.

### 4. Verify It Works

1. Go to **Settings** → **Environment Variables**
2. You should see these auto-added:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

3. Redeploy your app (automatic after connecting)

### 5. Test Your App

Visit your Vercel URL and:
1. Login as admin with the configured password
2. Add students using "Seed 9 Students"
3. Students can login with their access codes
4. Progress is now saved permanently!

## Database Management

### View Your Data
1. In Vercel Dashboard → Storage → Your Database
2. Click **Data** tab to browse tables
3. Or click **Query** to run SQL

### Backup Your Data
- Vercel automatically backs up daily
- You can also export manually from the Data tab

### Reset Database (if needed)
```sql
-- Run in Query tab to clear all data
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS exam_status CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
-- Tables will recreate on next app visit
```

## Local Development with Vercel Postgres

To use the production database locally:

1. Pull environment variables:
```bash
vercel env pull .env.local
```

2. Run your app:
```bash
npm run dev
```

Now local development uses the same database as production!

## Cost Management

### Free Tier Limits (More than enough):
- **Compute:** 60 hours/month (your app uses ~1 hour/month)
- **Storage:** 256MB (your app needs <1MB)
- **Transfer:** 256MB/month

### Monitor Usage:
1. Vercel Dashboard → Storage → Your Database
2. Click **Usage** tab
3. Shows compute hours and storage used

## Alternatives (if needed)

If you somehow exceed limits (unlikely):

### Option 1: Supabase (Also Free)
- 500MB database
- Unlimited API requests
- [supabase.com](https://supabase.com)

### Option 2: Neon Directly (Free)
- 3GB storage
- Always-on
- [neon.tech](https://neon.tech)

### Option 3: PlanetScale (Free)
- 5GB storage
- MySQL instead of PostgreSQL
- [planetscale.com](https://planetscale.com)

## Troubleshooting

### "Database not connecting"
- Check Environment Variables in Vercel dashboard
- Redeploy the project
- Check Vercel Functions logs

### "Tables don't exist"
- The app auto-creates tables on first visit
- Just refresh the page

### "Can't add students"
- Check if database is paused (unlikely)
- Check Vercel Functions logs for errors

## Support
- Vercel Docs: https://vercel.com/docs/storage/vercel-postgres
- Database Dashboard: https://vercel.com/dashboard/stores

---

Your database will easily last through October and beyond with zero maintenance required!