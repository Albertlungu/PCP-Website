# Decap CMS Setup Guide

## What You've Got

The admin system files are now in your PCP-Website folder:
- `/admin/index.html` - The admin interface
- `/admin/config.yml` - CMS configuration
- `/_data/students/sample-student.md` - Example student
- `/js/students-loader.js` - Dynamic student loader (updated)
- `/our-students.html` - Already configured to load dynamically

## What Happens Now

When you visit `yoursite.com/admin`, you'll see Decap CMS asking you to log in with GitHub.

## Authentication Setup (Two Options)

### Option A: Netlify (Easiest - Recommended)

**Why this way:** Netlify handles all the OAuth complexity for you. One-click setup.

**Steps:**
1. Go to [netlify.com](https://netlify.com) and sign up (free account)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your `PCP-Website` repository
4. Deploy settings:
   - Build command: (leave blank)
   - Publish directory: (leave blank, or just `/`)
   - Click "Deploy"
5. Once deployed, go to "Site configuration" → "Identity"
6. Click "Enable Identity"
7. Go to "Identity" → "Settings and usage"
8. Scroll down to "Git Gateway" and click "Enable Git Gateway"
9. That's it.

**Testing:**
- Visit `your-netlify-site.netlify.app/admin`
- You'll be asked to create an account
- Once logged in, you can add/edit students

**Keeping Vercel:**
- You can keep your Vercel deployment at `yoursite.vercel.app`
- Use Netlify ONLY for the admin interface at `admin-site.netlify.app/admin`
- When you edit students via Netlify admin, changes push to GitHub, which triggers Vercel to rebuild
- This means TWO deployments: one on Vercel (public site) and one on Netlify (admin only)

**Cost:** $0/month (both free tiers)

---

### Option B: GitHub OAuth with Vercel (Harder)

**Why this way:** Keeps everything on Vercel, no second deployment needed.

**The problem:** Vercel doesn't provide built-in OAuth like Netlify does, so you need to set up a GitHub OAuth App manually and use a third-party OAuth service.

**Steps:**
1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Application name: "PCP Website Admin"
3. Homepage URL: `https://your-site.vercel.app`
4. Authorization callback URL: `https://api.netlify.com/auth/done`
   (Yes, even though you're on Vercel, Decap CMS uses Netlify's auth endpoint)
5. Click "Register application"
6. Copy the Client ID
7. Generate a new Client Secret and copy it

8. Update `/admin/config.yml`:
```yaml
backend:
  name: github
  repo: Albertlungu/PCP-Website
  branch: main
  base_url: https://api.netlify.com  # Use Netlify's OAuth endpoint
  auth_endpoint: auth
```

9. In Netlify (yes, you still need a Netlify account, but only for OAuth):
   - Create a free Netlify account
   - Don't deploy your site, just go to "User settings" → "Applications"
   - Add a new OAuth application
   - Paste your GitHub OAuth App Client ID and Secret
   - This allows Netlify's auth endpoint to work with your GitHub app

10. Test: Visit `your-vercel-site.vercel.app/admin`

**Cost:** $0/month (Netlify account just for OAuth is free, no site deployment)

---

## My Honest Recommendation

**Go with Option A (Netlify deployment)**

**Why:**
- Takes 5 minutes vs 30+ minutes
- Less error-prone
- Netlify is designed for this exact use case
- You can always migrate back to Vercel-only later if needed
- Both deployments will auto-update from GitHub, so your content stays in sync

**What it looks like:**
- Public users visit: `yoursite.vercel.app` (or your custom domain)
- You visit: `yoursite.netlify.app/admin` to edit students
- GitHub is the source of truth, both sites pull from it

---

## After Authentication Works

1. Visit `/admin`
2. Log in with GitHub
3. Click "Students" in the sidebar
4. Click "New Student"
5. Fill in:
   - Student Name
   - Description
   - Upload Profile Image (optional)
   - Order (lower numbers appear first)
6. Click "Publish"
7. Wait 1-2 minutes for Vercel to rebuild
8. Visit `/our-students.html` - your new student appears!

---

## Testing Locally First

Before deploying, test if the files work:

1. Open Terminal
2. Navigate to your project:
   ```bash
   cd ~/Documents/PCP-Website
   ```
3. Run a local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open browser to: `http://localhost:8000/our-students.html`
5. You should see either:
   - "Loading students..." (then an error about GitHub API, which is expected)
   - The sample student if you're online

If the page loads without JavaScript errors, the files are good.

---

## Commit and Push to GitHub

1. Open Terminal
2. Navigate to project:
   ```bash
   cd ~/Documents/PCP-Website
   ```
3. Add all new files:
   ```bash
   git add admin/ _data/ js/students-loader.js
   ```
4. Commit:
   ```bash
   git commit -m "Add Decap CMS admin system for student profiles"
   ```
5. Push to GitHub:
   ```bash
   git push origin main
   ```

Now the files are live on GitHub and ready for deployment.

---

## Troubleshooting

**"Config error: Error loading config"**
- Your `config.yml` has a syntax error
- Check spacing (YAML is space-sensitive, use 2 spaces for indentation)
- Make sure `repo: Albertlungu/PCP-Website` matches your actual GitHub username/repo

**"Error: Authentication Required"**
- OAuth isn't set up correctly
- Go back through the authentication steps
- Make sure Git Gateway is enabled (Netlify) or GitHub OAuth app is configured correctly

**"404 when visiting /admin"**
- Files aren't deployed yet
- Run `git status` to check if files are committed
- Run `git push` to push to GitHub
- Wait for Vercel/Netlify to rebuild

**Students not appearing on /our-students.html**
- Check browser console (F12) for JavaScript errors
- Make sure `students-loader.js` is loaded (check Network tab)
- Verify student files exist in `/_data/students/` on GitHub

**Images not showing**
- Make sure images are in `/images/students/` folder
- Image paths in markdown should be relative: `image: "/images/students/photo.jpg"`
- Verify image files are pushed to GitHub

---

## Next Steps

1. Test locally (optional but recommended)
2. Commit and push to GitHub
3. Choose authentication method (A or B)
4. Set up authentication
5. Test admin interface
6. Add your first real student!

Let me know which route you want to go and I'll help you through it.
