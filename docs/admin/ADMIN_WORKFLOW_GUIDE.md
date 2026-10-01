# Complete Admin Workflow Guide

## Overview

Your website now has two separate areas:
- **Public Site**: `yoursite.vercel.app/` - Anyone can view
- **Admin Area**: `yoursite.vercel.app/admin/` - Password protected, for editing

## File Structure

```
PCP-Website/
├── admin.html                 # Local editing panel (localhost only)
├── our-students.html          # Public students page (everyone)
├── admin/
│   ├── index.html            # Admin panel on Vercel (view-only)
│   ├── our-students.html     # Admin preview (with banner)
│   ├── password-protection.js # Password system
│   └── PASSWORD_SETUP.md     # How to set password
├── js/
│   ├── admin-students.js     # Admin panel functionality
│   └── students-loader.js    # Loads students (with path detection)
└── admin-server.js           # Local server for editing
```

## Workflows

### Local Editing (Recommended)

**For adding/editing students:**

1. Start the server:
   ```bash
   Double-click: START_ADMIN.command
   ```

2. Open admin panel:
   ```
   http://localhost:3000/admin.html
   ```

3. Edit students:
   - Add, edit, or remove students
   - Upload images
   - Preview changes

4. Export & Deploy:
   - Click "Export HTML"
   - System automatically:
     ✓ Saves to our-students.html
     ✓ Commits to Git
     ✓ Pushes to GitHub
     ✓ Vercel deploys in ~2 minutes

5. Check live site:
   ```
   https://yoursite.vercel.app/our-students.html
   ```

### Vercel Admin Area (View Only)

**For viewing current students remotely:**

1. Go to:
   ```
   https://yoursite.vercel.app/admin/
   ```

2. Enter password when prompted

3. You can:
   - View all students
   - See history
   - View preview of students page
   - **Note**: Cannot edit or save (view-only mode)

4. To actually edit, use localhost admin panel

## URLs Explained

| URL | Purpose | Who Can Access | Can Edit? |
|-----|---------|----------------|-----------|
| `localhost:3000/admin.html` | **Edit students** | Only on your computer | ✅ Yes |
| `localhost:3000/our-students.html` | Preview locally | Only on your computer | ❌ No |
| `vercel.app/our-students.html` | **Public page** | Everyone | ❌ No |
| `vercel.app/admin/` | View admin panel | Password holders | ❌ View only |
| `vercel.app/admin/our-students.html` | Admin preview | Password holders | ❌ View only |

## Setting Admin Password

See `admin/PASSWORD_SETUP.md` for detailed instructions.

Quick steps:
```bash
# Generate password hash
echo -n "YourPassword" | shasum -a 256

# Edit admin/password-protection.js
# Replace ADMIN_PASSWORD_HASH with your hash
```

## Features

### Admin Banner Detection

The system automatically detects which page you're viewing:

- **Public page** (`/our-students.html`): No banner, clean look
- **Admin preview** (`/admin/our-students.html`): Shows "PREVIEW MODE" banner

### View-Only Mode on Vercel

When accessing `/admin/` on Vercel:
- Blue banner appears: "VIEW-ONLY MODE"
- Badge shows "View Only" instead of "Editing Mode"
- All features work but changes won't save
- Reminds you to use localhost for editing

### Password Protection

- **Localhost**: No password needed (for easy editing)
- **Vercel**: Password required on first visit
- **Session-based**: Valid until browser closes
- **Secure**: Password stored as SHA-256 hash

## Troubleshooting

### "I made changes but they're not on Vercel"

Check:
1. Did you click "Export HTML"?
2. Did you see "Success! Changes deployed"?
3. Wait 2-3 minutes for Vercel to deploy
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

### "Admin banner shows on public page"

This should no longer happen! The system now:
- Checks the URL path
- Only shows banner on `/admin/our-students.html`
- Public page (`/our-students.html`) has no banner

### "I forgot the admin password"

1. Go to `admin/password-protection.js`
2. Generate new password hash:
   ```bash
   echo -n "NewPassword" | shasum -a 256
   ```
3. Replace the `ADMIN_PASSWORD_HASH` value
4. Commit and push to GitHub
5. Wait for Vercel to deploy (~2 minutes)

### "CSS/Images broken in /admin/ area"

All file paths in `/admin/` files should use `../` prefix:
- CSS: `href="../css/styles.css"`
- JS: `src="../js/admin-students.js"`
- Links: `href="../index.html"`

Check the file and ensure all paths start with `../`

## Best Practices

1. **Always edit locally** using `localhost:3000/admin.html`
2. **Use Export HTML** to deploy (automatic Git commit/push)
3. **Set a strong password** for /admin/ area on Vercel
4. **Keep server running** while editing
5. **Wait for "Success" message** before closing
6. **Preview locally first** before deploying

## Security Notes

✓ Password protection on Vercel admin area
✓ Robots excluded from indexing /admin/ (vercel.json)
✓ Session-based authentication (no cookies stored)
✓ Password stored as SHA-256 hash (not plain text)
✓ Local editing doesn't require password
✓ Public page has no admin access

## Summary

**Local Editing Workflow:**
```
1. Start server (START_ADMIN.command)
2. Edit at localhost:3000/admin.html
3. Click Export HTML
4. Wait ~2 minutes
5. Check yoursite.vercel.app/our-students.html
```

**Remote Viewing Workflow:**
```
1. Go to yoursite.vercel.app/admin/
2. Enter password
3. View students (read-only)
4. To edit, use local workflow above
```

**Public Viewing:**
```
1. Go to yoursite.vercel.app/our-students.html
2. See clean page (no admin banner)
```

---

**Questions?** Check the other guide files:
- `IMPORTANT_ADMIN_NOTE.md` - Where to use admin panel
- `VERCEL_DEPLOYMENT_GUIDE.md` - How auto-deployment works
- `admin/PASSWORD_SETUP.md` - Setting up password protection
