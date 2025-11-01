# Admin Panel Setup Guide

This guide explains how to set up the admin panel so it can automatically save student profiles to GitHub from Vercel.

## Features

- ✅ **Auto-save to GitHub**: Changes are committed directly to your repository
- ✅ **Works on Vercel**: No need to run a local server
- ✅ **Automatic deployment**: Vercel auto-deploys after each commit (~2 minutes)
- ✅ **Secure**: Uses GitHub Personal Access Token (stored in Vercel environment variables)

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name: `PCP Website Admin Panel`
4. Set expiration: Choose your preferred duration (or "No expiration" for convenience)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Click **"Generate token"**
7. **IMPORTANT**: Copy the token immediately! You won't be able to see it again.
   - It will look something like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Add Environment Variables to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your **PCP-Website** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   | Variable Name  | Value | Environment |
   |---------------|-------|-------------|
   | `GITHUB_TOKEN` | `ghp_your_token_here` | Production, Preview, Development |
   | `GITHUB_OWNER` | `Albertlungu` | Production, Preview, Development |
   | `GITHUB_REPO` | `PCP-Website` | Production, Preview, Development |

5. Click **"Save"** for each variable

### 3. Redeploy Your Site

After adding the environment variables, you need to trigger a new deployment:

1. In Vercel Dashboard, go to **Deployments**
2. Click the **⋮** menu on the latest deployment
3. Click **"Redeploy"**
4. Or simply push a new commit to trigger automatic deployment

### 4. Test the Admin Panel

1. Go to your site: `https://your-site.vercel.app/admin.html`
2. Add or edit a student
3. Click **"Export HTML"**
4. The system should automatically save and commit to GitHub
5. You'll see a success message: **"Success! Changes deployed - Live on Vercel in ~2 minutes"**
6. Check your GitHub repository - you should see a new commit!

## How It Works

### Architecture

```
Admin Panel (Browser)
       ↓
       ↓ (sends student data)
       ↓
Vercel Serverless Function (/api/save-students.js)
       ↓
       ↓ (GitHub API)
       ↓
GitHub Repository (main branch)
       ↓
       ↓ (webhook)
       ↓
Vercel Auto-Deploy (~2 minutes)
       ↓
Live Website Updated! ✅
```

### What Happens When You Click "Export HTML"

1. **Admin panel** sends student data to `/api/save-students`
2. **Vercel serverless function** receives the data
3. Function **fetches** the current `our-students.html` file from GitHub
4. Function **generates** new HTML with updated student cards
5. Function **commits** the changes back to GitHub with a timestamp
6. GitHub **triggers** Vercel webhook
7. Vercel **automatically deploys** the updated site (~2 minutes)
8. **Success!** Changes are live

## Local Development

If you want to test locally, you can still use the Node.js server:

```bash
cd PCP-Website
node server/admin-server.js
```

Then access: http://localhost:3000/admin.html

The admin panel automatically detects if you're on localhost and uses the local server instead of the Vercel function.

## Security Notes

- ⚠️ **Never commit your GitHub token to the repository**
- ✅ The token is stored securely in Vercel environment variables
- ✅ The admin panel has password protection (password: `pcp2025`)
- ✅ The `/admin` path has `noindex, nofollow` headers (robots won't index it)

## Troubleshooting

### "Server configuration error: GitHub token not set"

**Solution**: Make sure you've added `GITHUB_TOKEN` to Vercel environment variables and redeployed.

### "Failed to commit to GitHub"

**Possible causes**:
- Token expired (create a new one)
- Token doesn't have `repo` permissions (recreate with correct permissions)
- Repository name or owner is incorrect (check `GITHUB_OWNER` and `GITHUB_REPO`)

### Changes not appearing on the site

**Wait 2-3 minutes** for Vercel to rebuild and deploy. You can monitor deployment status in the Vercel Dashboard.

### Auto-save not working on localhost

**Solution**: Make sure the local server is running:
```bash
node server/admin-server.js
```

## Support

If you encounter any issues, check:
1. Vercel deployment logs (Dashboard → Deployments → View Function Logs)
2. Browser console (F12 → Console tab)
3. GitHub commits (verify the commit was created)

---

**Last Updated**: 2025-01-01
**Version**: 2.0
