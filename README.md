# PCP Website - Pre-College Program

## Overview
Website for the University of Ottawa Pre-College Music Program featuring:
- Performance calendar with interactive calendar and list views
- Student signup system for performances  
- Program information and student profiles
- Dropdown navigation for better organization

## Recent Updates

### Navigation Improvements (Latest)
- **Compact Design**: Navbar now uses `fit-content` width - automatically adjusts to content size
- **Dropdown Menus**: Organized navigation into logical groups:
  - **Program**: Chamber Music, Masterclasses, Performance Class, Schedule
  - **Participate**: Calendar, Sign Up to Perform
- **Perfect Alignment**: Dropdowns positioned directly under parent labels (left-aligned)
- **Improved Hover Behavior**: Dropdown stays open while hovering over the dropdown menu itself
- **Shorter Labels**: "Description" → "About", "Code of Conduct" → "Conduct"

### Performance Calendar (`calendar.html`)
- Interactive monthly calendar view with clickable dates
- List view showing all events chronologically
- Filter by event type (masterclasses, performances, special events)
- Click any event to see full details in a modal popup
- Color-coded event indicators (Gold = Masterclass, Burgundy = Performance, Blue = Special)

### Signup System (`signup.html`)
- Displays available performance slots at the top
- Complete registration form with validation
- Auto-formatting for duration field (minutes' seconds")
- Real-time form validation with helpful error messages
- Submits directly to Google Spreadsheet

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox, Grid, and glassmorphism effects
- **JavaScript** - Interactive features, calendar logic, form handling
- **Google Fonts** - Inter and Playfair Display fonts

## Design Features

- Custom color scheme: Burgundy (#6d0a2e) and Gold (#d4af37)
- Floating navigation bar with glassmorphism effect
- Smooth animations and transitions throughout
- Dropdown menus with frosted glass effect
- Interactive background with floating music notes
- Click ripple effects and animated musical symbols
- Mobile-first responsive design
- Dark gradient background with subtle patterns

## Pages

1. **Home** (`index.html`) - Landing page with hero section and program highlights
2. **About** (`description.html`) - Detailed program information
3. **Program Pages**:
   - Chamber Music (`chamber-music.html`)
   - Masterclasses (`masterclasses.html`)
   - Performance Class (`performance-class.html`)
   - Schedule (`schedule.html`)
4. **Participate**:
   - Calendar (`calendar.html`) - View all upcoming events
   - Sign Up (`signup.html`) - Register to perform
5. **Our Students** (`our-students.html`) - Student profiles
6. **Conduct** (`code-of-conduct.html`) - Student conduct guidelines

## Setup Instructions

### For Calendar & Signup Features

1. **Google Apps Script Setup** (for signup form):
   - See `SETUP.md` for detailed instructions
   - Creates a web app that writes to your Google Spreadsheet
   
2. **Google Sheets API** (optional, for dynamic calendar updates):
   - Get API key from Google Cloud Console
   - Update `calendar.js` with your API key

Currently, the calendar uses embedded data from your spreadsheet and works without additional setup. The signup form requires Google Apps Script configuration.

## File Structure

```
pcp-website/
├── index.html                      # Homepage
├── description.html                # Program description
├── schedule.html                   # Schedule information
├── chamber-music.html              # Chamber music details
├── masterclasses.html              # Masterclasses info
├── performance-class.html          # Performance class details
├── calendar.html                   # NEW: Calendar page
├── signup.html                     # NEW: Signup form
├── our-students.html               # Student profiles
├── code-of-conduct.html            # Code of conduct
├── styles.css                      # Main stylesheet
├── styles-calendar-signup.css      # Calendar & signup styles
├── script.js                       # Main JavaScript
├── calendar.js                     # Calendar functionality
├── signup.js                       # Signup form handling
├── README.md                       # This file
├── SETUP.md                        # Setup instructions
└── VISUAL-GUIDE.md                 # Visual representation of pages
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6d0a2e;    /* Burgundy */
    --accent-color: #d4af37;      /* Gold */
    --secondary-color: #101624;   /* Dark blue */
}
```

### Adding Navigation Items
Edit the navigation `<ul class="nav-menu">` in each HTML file. For dropdowns, use:
```html
<li class="has-dropdown">
    <a href="#" class="dropdown-toggle">Label</a>
    <ul class="dropdown-menu">
        <li><a href="page.html">Item</a></li>
    </ul>
</li>
```

## Credits

Designed and developed for the University of Ottawa Pre-College Program.

## License

© 2024 University of Ottawa Pre-College Program. All rights reserved.
