# 🎵 UOttawa Pre-College Program Website

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

> Professional website for the University of Ottawa Pre-College Music Program with integrated admin panel for easy content management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This is a modern, responsive website for the UOttawa Pre-College Program featuring:
- **Public Website**: Informational pages about the program, events, and students
- **Admin Panel**: Easy-to-use interface for managing student profiles
- **Auto-Deployment**: Automatic deployment to Vercel via Git integration
- **Password Protection**: Secure admin area with session-based authentication

## ✨ Features

### Public Website
- 📱 Fully responsive design
- 🎨 Modern glassmorphism UI
- 🎭 Interactive navigation with dropdowns
- 📅 Event calendar integration
- 👥 Dynamic student profiles
- 📝 Sign-up forms for performances

### Admin Panel
- ✏️ Add, edit, and delete student profiles
- 🖼️ Image upload (base64) or URL input
- 🔄 Undo/Redo functionality (50-item history)
- 💾 Auto-save with Git integration
- 📤 One-click deployment to Vercel
- 🔒 Password-protected admin area
- 🎨 Modern UI with soft red glow effect
- 📱 Responsive design for all devices

### Technical Features
- ⚡ Vanilla JavaScript (no framework dependencies)
- 🎯 LocalStorage for offline editing
- 🔄 Auto-commit and push to GitHub
- 🚀 Automatic Vercel deployment
- 🔐 SHA-256 password hashing
- 📦 Modular code structure
- 📚 Comprehensive documentation

## 📁 Project Structure

```
PCP-Website/
│
├── 📄 *.html                   # Public pages (root level for Vercel)
│   ├── index.html             # Homepage
│   ├── description.html       # About page
│   ├── our-students.html      # Student profiles
│   ├── calendar.html          # Event calendar
│   └── ...
│
├── 🎨 css/                     # Stylesheets
│   ├── styles.css             # Main public styles
│   ├── admin.css              # Admin panel styles
│   └── styles-calendar-signup.css
│
├── 📜 js/                      # JavaScript files
│   ├── admin-students.js      # Admin panel logic
│   ├── students-loader.js     # Dynamic student loading
│   └── ...
│
├── 🖼️ images/                  # Image assets
│
├── 🔐 admin/                   # Password-protected admin area
│   ├── index.html             # Admin panel
│   ├── our-students.html      # Admin preview
│   └── password-protection.js # Auth system
│
├── 🖥️ server/                  # Server-side scripts
│   ├── admin-server.js        # Local development server
│   └── START_ADMIN.command    # Mac startup script
│
├── 📚 docs/                    # Documentation
│   ├── admin/                 # Admin guides
│   ├── setup/                 # Setup instructions
│   ├── deployment/            # Deployment guides
│   └── QUICK_START.md
│
├── 📊 _data/                   # Data files
│   └── students/              # Student markdown files
│
├── ⚙️ vercel.json              # Vercel configuration
└── 📖 README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- Git
- A text editor (VS Code recommended)

### For Content Editors (Non-Coders)

1. **Start the admin server:**
   ```bash
   # On Mac: Double-click
   server/START_ADMIN.command
   
   # On Windows/Linux:
   cd server
   node admin-server.js
   ```

2. **Open admin panel:**
   ```
   http://localhost:3000/admin.html
   ```

3. **Edit students:**
   - Click "Add New Student"
   - Upload image or enter URL
   - Fill in name and bio
   - Click "Save Student"

4. **Deploy changes:**
   - Click "Export HTML"
   - Wait for "Success! Changes deployed" message
   - Changes will be live on Vercel in ~2 minutes

### For Developers

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pcp-website.git
   cd pcp-website
   ```

2. **Start development server:**
   ```bash
   node server/admin-server.js
   ```

3. **Make changes and test locally**

4. **Commit and deploy:**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

### Admin Guides
- [Admin Workflow Guide](docs/admin/ADMIN_WORKFLOW_GUIDE.md) - Complete workflow
- [Important Admin Note](docs/admin/IMPORTANT_ADMIN_NOTE.md) - Quick reference
- [Password Setup](docs/admin/PASSWORD_SETUP.md) - Security configuration
- [Admin Guide](docs/admin/ADMIN_GUIDE.md) - Detailed admin instructions

### Deployment
- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) - Auto-deployment
- [Quick Start](docs/QUICK_START.md) - Get started quickly

### Setup
- [Decap CMS Setup](docs/setup/DECAP_CMS_SETUP.md) - Optional CMS
- [Google Sheets Setup](docs/setup/GOOGLE_SHEETS_SETUP.md) - Integration guide

## 🛠️ Development

### Code Organization

- **HTML Files**: Root level (required for Vercel routing)
- **CSS Files**: `/css` folder (standard web convention)
- **JavaScript Files**: `/js` folder (standard web convention)
- **Admin Files**: `/admin` folder (password-protected area)
- **Server Scripts**: `/server` folder (Node.js scripts)
- **Documentation**: `/docs` folder (organized by topic)

### Code Documentation

All code is comprehensively documented with:
- **JSDoc comments** for JavaScript files
- **CSS section headers** with descriptions
- **HTML comments** explaining page structure
- **Inline comments** for complex logic

### Key Files

- `js/admin-students.js` - Admin panel functionality (600+ lines, fully documented)
- `css/admin.css` - Admin UI styling (comprehensive design system)
- `server/admin-server.js` - Local server with Git automation
- `js/students-loader.js` - Dynamic student profile loading

## 🚀 Deployment

### Automatic Deployment (Recommended)

1. **Edit locally** at `localhost:3000/admin.html`
2. **Click "Export HTML"** in admin panel
3. **Server automatically:**
   - Saves changes to `our-students.html`
   - Commits to Git with timestamp
   - Pushes to GitHub
   - Triggers Vercel deployment

### Manual Deployment

```bash
git add .
git commit -m "Update content"
git push origin main
```

Vercel will automatically detect the push and deploy in ~2 minutes.

### Vercel Admin Area

- **URL**: `https://yoursite.vercel.app/admin/`
- **Mode**: View-only (no editing capabilities)
- **Purpose**: Preview current students remotely
- **Access**: Password-protected

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use **2 spaces** for indentation
- Follow **JSDoc** conventions for JavaScript
- Add **section comments** in CSS files
- Write **semantic HTML**
- Keep functions **small and focused**
- Add **comprehensive comments**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the UOttawa Pre-College Program
- Powered by [Vercel](https://vercel.com)
- Developed with assistance from [Claude Code](https://claude.com/claude-code)

## 📞 Support

For questions or issues:
- 📧 Email: contact@uottawa-pcp.ca
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/pcp-website/issues)
- 📖 Docs: See `/docs` folder

## 🔄 Version History

- **v2.0.0** - Complete redesign with organized structure and comprehensive documentation
- **v1.5.0** - Added admin panel with auto-deployment
- **v1.0.0** - Initial release

---

**Made with 🎵 by the UOttawa Pre-College Team**
