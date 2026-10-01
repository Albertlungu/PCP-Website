# Decap CMS Files - Verification Checklist

## Files Created

Check that these files exist in your `/Documents/PCP-Website/` folder:

### Core Admin Files
- [ ] `/admin/index.html` - Admin interface page
- [ ] `/admin/config.yml` - CMS configuration

### Data Files
- [ ] `/_data/students/sample-student.md` - Example student profile

### JavaScript
- [ ] `/js/students-loader.js` - Dynamic student loader (UPDATED)

### Documentation
- [ ] `/DECAP_CMS_SETUP.md` - Setup guide (this was just created)

### Existing Files (Already There)
- [x] `/our-students.html` - Already configured with students-grid
- [x] `/images/students/` - Empty folder, ready for student photos
- [x] `/css/styles.css` - Already has student-card styling

## Quick File Check

Run this in Terminal to verify all files exist:

```bash
cd ~/Documents/PCP-Website
ls -la admin/
ls -la _data/students/
ls -la js/students-loader.js
```

## What Each File Does

**`/admin/index.html`**
- Loads the Decap CMS interface
- This is the page you'll visit to edit students

**`/admin/config.yml`**
- Tells Decap CMS where your GitHub repo is
- Defines what fields students have (name, description, image, order)
- Sets where images should be stored

**`/_data/students/sample-student.md`**
- Example student profile in markdown format
- Shows the structure: frontmatter (metadata) + optional content
- You can delete this later

**`/js/students-loader.js`**
- Fetches student markdown files from GitHub
- Parses them and displays them on the page
- Automatically sorts by order number

**`/our-students.html`**
- Already set up with `id="students-grid"`
- Already includes `students-loader.js` at the bottom
- No changes needed!

## What Happens When You Edit a Student

1. You visit `/admin` and log in
2. You edit a student profile
3. Click "Publish"
4. Decap CMS commits changes to GitHub
5. GitHub triggers Vercel to rebuild
6. 1-2 minutes later, the changes are live

## Git Status Check

Before you commit, verify what's changed:

```bash
cd ~/Documents/PCP-Website
git status
```

You should see:
- `new file:   admin/index.html`
- `new file:   admin/config.yml`
- `new file:   _data/students/sample-student.md`
- `modified:   js/students-loader.js`
- `new file:   DECAP_CMS_SETUP.md`

## If Something's Wrong

If any files are missing:
1. Let me know which file
2. I can recreate it
3. We'll figure out what went wrong

All files should be in `/Users/albertlungu/Documents/PCP-Website/` and visible in Finder.
