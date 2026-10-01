# 🎵 Admin Panel Auto-Save Guide

## ✨ What This Does

The admin panel can now **automatically update the source code** when you press "Export HTML"!

No more copy-pasting code manually. Just click and it's done! 🎉

---

## 🚀 Quick Start (Non-Coders)

### Step 1: Install Node.js (One-Time Setup)

1. Go to: **https://nodejs.org/**
2. Download the **LTS version** (the big green button)
3. Run the installer and follow the prompts
4. Restart your computer

### Step 2: Start the Admin Server

**Option A: Double-Click Method (Easiest)**
- Double-click the file: **`START_ADMIN.command`**
- A terminal window will open showing the server is running
- **Keep this window open** while using the admin panel

**Option B: Terminal Method**
```bash
cd /Users/albertlungu/documents/github/pcp-website
node admin-server.js
```

### Step 3: Use the Admin Panel

1. **Open your browser** and go to:
   ```
   http://localhost:3000/admin.html
   ```

2. **Add/Edit students** as usual

3. **Click "Export HTML"** button

4. **Magic happens!** 🎉
   - The source code is automatically updated
   - You'll see: "🎉 Source code updated!"
   - No manual copy-paste needed!

5. **View the changes**:
   - Click "Preview" or go to: `http://localhost:3000/our-students.html`
   - Your changes are live in the actual HTML file!

---

## 📋 How It Works

### For Non-Coders:
- The server lets the admin panel write files to your computer
- When you click "Export HTML", it saves directly to `our-students.html`
- Everything happens automatically!

### For Developers:
- Node.js server running on `localhost:3000`
- Admin panel sends POST request to `/api/save-students`
- Server updates `our-students.html` with new student data
- Falls back to manual export if server isn't running

---

## 🎯 Workflow

### With Server Running (Auto-Save):
```
1. Double-click START_ADMIN.command
2. Open http://localhost:3000/admin.html
3. Add/edit students
4. Click "Export HTML"
5. See "🎉 Source code updated!" notification
6. Done! ✅
```

### Without Server (Manual):
```
1. Open admin.html directly (file://)
2. Add/edit students
3. Click "Export HTML"
4. Copy the code manually
5. Paste into our-students.html
```

---

## 🛠️ Troubleshooting

### "Port 3000 is already in use"
**Solution:** Another app is using port 3000
- Close other development servers
- Or edit `admin-server.js` and change `PORT = 3000` to another number

### "Node.js is not installed"
**Solution:** Install Node.js from https://nodejs.org/

### "Cannot connect to server"
**Solution:** Make sure the server is running
- Look for the terminal window with the server
- If closed, double-click `START_ADMIN.command` again

### Server won't start on Mac
**Solution:** Enable execution permissions
```bash
chmod +x START_ADMIN.command
```

---

## 🔒 Security Notes

- The server only runs **locally** (localhost)
- Not accessible from the internet
- Only you can access it from your computer
- Safe to use for local development

---

## 💡 Tips

1. **Keep the terminal window open** while using admin panel
2. **Use localhost URL** (http://localhost:3000/admin.html) not file://
3. **Test with Preview** before deploying to production
4. **Commit changes** to Git after making updates

---

## 🎓 For Production Deployment

After making changes locally:

1. **Commit to Git:**
   ```bash
   git add our-students.html
   git commit -m "Update student profiles"
   git push
   ```

2. **Vercel auto-deploys** from your GitHub repository

3. **Check live site** after ~2 minutes

---

## ❓ Questions?

- Server runs at: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin.html`
- Preview page: `http://localhost:3000/our-students.html`
- Source code: `our-students.html` in this folder

**Happy editing!** 🎵
