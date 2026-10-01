# 📚 Documentation Index

Welcome to the UOttawa Pre-College Website documentation!

## 🗂️ Documentation Structure

### 🎯 Quick Access
- **New here?** Start with [Quick Start Guide](QUICK_START.md)
- **Need to edit students?** See [Admin Workflow Guide](admin/ADMIN_WORKFLOW_GUIDE.md)
- **Setting up password?** Check [Password Setup](admin/PASSWORD_SETUP.md)
- **Deploying to Vercel?** Read [Vercel Deployment Guide](deployment/VERCEL_DEPLOYMENT_GUIDE.md)

## 📖 Complete Documentation

### 🔐 Admin Guides
Comprehensive guides for content management and admin panel usage.

| Guide | Description | Audience |
|-------|-------------|----------|
| [Admin Workflow Guide](admin/ADMIN_WORKFLOW_GUIDE.md) | Complete workflow for editing and deploying | Everyone |
| [Important Admin Note](admin/IMPORTANT_ADMIN_NOTE.md) | Quick reference for admin panel usage | Quick reference |
| [Admin Guide](admin/ADMIN_GUIDE.md) | Detailed admin panel instructions | Content editors |
| [Password Setup](admin/PASSWORD_SETUP.md) | How to set up admin area password | Administrators |
| [Admin Auto Save Guide](admin/ADMIN_AUTO_SAVE_GUIDE.md) | Understanding auto-save feature | Technical users |

### 🚀 Deployment Guides
Instructions for deploying and managing the live website.

| Guide | Description | Audience |
|-------|-------------|----------|
| [Vercel Deployment Guide](deployment/VERCEL_DEPLOYMENT_GUIDE.md) | Automatic deployment workflow | Everyone |

### ⚙️ Setup Guides
Initial setup and integration instructions.

| Guide | Description | Audience |
|-------|-------------|----------|
| [Decap CMS Setup](setup/DECAP_CMS_SETUP.md) | Optional CMS integration | Developers |
| [Google Sheets Setup](setup/GOOGLE_SHEETS_SETUP.md) | Calendar integration setup | Administrators |

### 📝 General
General project documentation and summaries.

| Document | Description |
|----------|-------------|
| [Quick Start](QUICK_START.md) | Get started in 5 minutes |
| [Implementation Summary](IMPLEMENTATION_SUMMARY.md) | Technical implementation details |

## 🎯 Common Tasks

### For Content Editors

**I want to add/edit students:**
1. Read: [Admin Workflow Guide](admin/ADMIN_WORKFLOW_GUIDE.md)
2. Quick ref: [Important Admin Note](admin/IMPORTANT_ADMIN_NOTE.md)

**I want to check if my changes are live:**
1. Wait 2 minutes after clicking "Export HTML"
2. Visit: `https://yoursite.vercel.app/our-students.html`
3. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)

**I forgot the admin password:**
1. Follow: [Password Setup Guide](admin/PASSWORD_SETUP.md)
2. Generate new hash and update `admin/password-protection.js`
3. Push changes to GitHub

### For Developers

**I want to understand the codebase:**
1. Start with [Main README](../README.md)
2. Check [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
3. Review code comments in `/js` and `/css` folders

**I want to add new features:**
1. Read [Contributing Guide](../CONTRIBUTING.md)
2. Review existing code structure
3. Follow established patterns
4. Add comprehensive documentation

**I want to modify the deployment process:**
1. Read: [Vercel Deployment Guide](deployment/VERCEL_DEPLOYMENT_GUIDE.md)
2. Check: `server/admin-server.js` (lines 77-132)
3. Test locally before pushing

## 🔍 Finding What You Need

### By Role

**Content Editor (Non-technical):**
- Start: [Quick Start](QUICK_START.md)
- Main guide: [Admin Workflow Guide](admin/ADMIN_WORKFLOW_GUIDE.md)
- Reference: [Important Admin Note](admin/IMPORTANT_ADMIN_NOTE.md)

**Administrator:**
- Security: [Password Setup](admin/PASSWORD_SETUP.md)
- Deployment: [Vercel Deployment Guide](deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- Integration: [Google Sheets Setup](setup/GOOGLE_SHEETS_SETUP.md)

**Developer:**
- Overview: [Main README](../README.md)
- Technical: [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- Contributing: [Contributing Guide](../CONTRIBUTING.md)
- Code: See inline documentation in `/js`, `/css`, `/server` folders

### By Topic

**Authentication & Security:**
- [Password Setup](admin/PASSWORD_SETUP.md)
- See also: `admin/password-protection.js` (inline comments)

**Content Management:**
- [Admin Workflow Guide](admin/ADMIN_WORKFLOW_GUIDE.md)
- [Admin Guide](admin/ADMIN_GUIDE.md)

**Deployment:**
- [Vercel Deployment Guide](deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- [Admin Auto Save Guide](admin/ADMIN_AUTO_SAVE_GUIDE.md)

**Setup & Configuration:**
- [Quick Start](QUICK_START.md)
- [Decap CMS Setup](setup/DECAP_CMS_SETUP.md)
- [Google Sheets Setup](setup/GOOGLE_SHEETS_SETUP.md)

## 🆘 Troubleshooting

**Problem: Changes not showing on Vercel**
- Guide: [Admin Workflow Guide](admin/ADMIN_WORKFLOW_GUIDE.md) → Troubleshooting section

**Problem: Admin panel not working**
- Check: [Important Admin Note](admin/IMPORTANT_ADMIN_NOTE.md)
- Ensure you're at: `localhost:3000/admin.html`

**Problem: Password not working**
- Reset: [Password Setup](admin/PASSWORD_SETUP.md)

**Problem: Images not loading**
- Check paths in HTML files
- Ensure images are in `/images` folder
- Verify base64 encoding for uploaded images

## 📞 Getting Help

1. **Check documentation** first (you're here!)
2. **Search** for your issue in guides above
3. **Review code comments** in relevant files
4. **Contact support** if still stuck:
   - Email: contact@uottawa-pcp.ca
   - GitHub Issues: [Report a bug](https://github.com/yourusername/pcp-website/issues)

## 🔄 Keeping Documentation Updated

When making changes to the project:
1. **Update relevant documentation**
2. **Add inline code comments**
3. **Update this index** if adding new docs
4. **Keep guides accurate** and up-to-date

---

**Last Updated:** 2025-01-31  
**Documentation Version:** 2.0.0  
**Project Version:** 2.0.0
