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
- **Password Protection**: Admin publishing is checked server-side

## ✨ Features

### Public Website
- 📱 Fully responsive design
- 🎨 Modern glassmorphism UI
- 🎭 Interactive navigation with dropdowns
- 📅 Event calendar integration
- 👥 Dynamic student profiles
- 📝 Sign-up forms for performances

### Admin Panel
- Add, edit, reorder, and delete student profiles at `/admin`
- Drafts stay in the browser until published
- Publishing commits `data/students.json` and photos to GitHub; Vercel redeploys automatically
- Password checked server-side by the Vercel function

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for setup and usage.

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
├── 🖼️ images/students/         # Student photos (written by the admin panel)
│
├── 📊 data/students.json       # Published student profiles
│
├── 🔐 admin/index.html         # Admin panel (password checked by the API)
│
├── ⚡ api/save-students.js     # Vercel function that publishes student profiles
│
├── 📚 docs/                    # Setup and deployment notes
│
├── ⚙️ vercel.json              # Vercel configuration
└── 📖 README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- Git
- A text editor (VS Code recommended)

### For Content Editors

Go to `/admin` on the live site, sign in, edit, and click **Publish**. See [ADMIN_SETUP.md](ADMIN_SETUP.md).

### For Developers

The site is static HTML, CSS, and JavaScript with one Vercel function in `api/`.

1. Clone the repository.
2. Preview the public pages with any static server (for example `python3 -m http.server`), or run `vercel dev` to also run the admin API locally.
3. Commit and push to `main`; Vercel deploys automatically.

## 📚 Documentation

- [Admin Panel Setup and Usage](ADMIN_SETUP.md)
- [Google Sheets Setup](docs/setup/GOOGLE_SHEETS_SETUP.md) - Calendar and sign-up integration

## 🛠️ Development

### Code Organization

- **HTML Files**: Root level (required for Vercel routing)
- **CSS Files**: `/css` folder (standard web convention)
- **JavaScript Files**: `/js` folder (standard web convention)
- **Admin Panel**: `/admin` folder
- **Serverless Function**: `/api` folder (publishes student profiles)
- **Documentation**: `/docs` folder (organized by topic)

### Code Documentation

All code is comprehensively documented with:
- **JSDoc comments** for JavaScript files
- **CSS section headers** with descriptions
- **HTML comments** explaining page structure
- **Inline comments** for complex logic

### Key Files

- `js/admin-students.js` - Admin panel
- `api/save-students.js` - Publishes `data/students.json` and photos to GitHub
- `js/students-loader.js` - Renders the Our Students page from `data/students.json`

## 🚀 Deployment

Every push to `main` deploys on Vercel, including commits made by the admin panel's Publish button.

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
