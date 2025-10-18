<<<<<<< HEAD
# PCP-Website
=======
# UOttawa Pre-College Program Website

A modern, responsive website for the University of Ottawa Pre-College Program, designed to showcase the program's offerings and student achievements.

## Features

- **Modern Design**: Clean, professional interface with smooth animations and transitions
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Easy Navigation**: Intuitive menu system with mobile-friendly hamburger menu
- **Rich Content**: Comprehensive information about the program, including:
  - Program Description
  - Schedule Information
  - Chamber Music Details
  - Masterclasses Information
  - Performance Class Overview
  - Code of Conduct
  - Student Profiles

## Pages

1. **Home** (`index.html`) - Landing page with hero section and program highlights
2. **Description** (`description.html`) - Detailed program information
3. **Schedule** (`schedule.html`) - Program schedule and timeline
4. **Chamber Music** (`chamber-music.html`) - Chamber music program details
5. **Masterclasses** (`masterclasses.html`) - Information about masterclass offerings
6. **Performance Class** (`performance-class.html`) - Performance class details
7. **Code of Conduct** (`code-of-conduct.html`) - Student conduct guidelines
8. **Our Students** (`our-students.html`) - Profiles of current students

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript** - Interactive features and animations
- **Google Fonts** - Inter font family for clean typography

## Design Features

- Custom color scheme featuring University of Ottawa branding
- Smooth scroll animations and transitions
- Card-based layout for content organization
- Gradient backgrounds and modern UI elements
- Intersection Observer API for scroll-triggered animations
- Mobile-first responsive design

## Getting Started

Simply open `index.html` in a web browser to view the website. No build process or dependencies required.

### Local Development

To run locally:

1. Clone or download this repository
2. Open `index.html` in your preferred web browser
3. Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js http-server
   npx http-server
   ```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors

The color scheme can be customized by modifying the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #8B1538;
    --secondary-color: #2C3E50;
    --accent-color: #E74C3C;
    /* ... other colors */
}
```

### Content

All content can be easily updated by editing the respective HTML files. The structure is semantic and well-commented for easy maintenance.

## File Structure

```
PCP-Website/
├── index.html              # Home page
├── description.html        # Program description
├── schedule.html          # Schedule page
├── chamber-music.html     # Chamber music page
├── masterclasses.html     # Masterclasses page
├── performance-class.html # Performance class page
├── code-of-conduct.html   # Code of conduct
├── our-students.html      # Student profiles
├── styles.css             # Main stylesheet
├── script.js              # JavaScript functionality
└── README.md              # This file
```

## Credits

Designed and developed for the University of Ottawa Pre-College Program.

## License

© 2024 University of Ottawa Pre-College Program. All rights reserved.
>>>>>>> 9c44ce2 (Initial commit (everything's basically already done...))
