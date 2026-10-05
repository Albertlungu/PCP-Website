# uOttawa Pre-College Program website

The public website of the University of Ottawa Pre-College Program (PCP): what the program is, this
year's calendar of masterclasses and performance classes, chamber room assignments, the snack
schedule, performance sign-ups, and student profiles.

It is a plain static site: HTML, CSS and JavaScript with no build step and no framework. If you can
edit a text file, you can maintain it. Most week-to-week content (dates, performers, rooms, snacks)
is not in this repository at all; it is read live from the program's Google Sheet.

## Where the site lives

| Where | What it serves | Updates when |
| --- | --- | --- |
| GitHub Pages, https://albertlungu.github.io/PCP-Website/ | the `prototype` branch | a minute or two after a push to `prototype` |
| Vercel | the `main` branch | about two minutes after a push to `main` |

GitHub Pages can only serve files. Vercel can also run the small server function in `api/`, which
the admin panel needs to publish student profiles (see [docs/admin-panel.md](docs/admin-panel.md)).

## Folder map

```
index.html                 Home page (must stay at the root: it is what the site address opens)
html/                      Every other page, grouped like the site's menus and footer
  about/                     the-program.html, our-students.html, code-of-conduct.html
  program/                   "Program" menu: chamber-music, masterclasses, performance-class, schedule
  participate/               "Participate" menu: calendar, chamber-rooms, snacks, signup
  admin/                     index.html, the admin panel for student profiles
css/
  site.css                   All public styles, in labelled sections (Navigation, Home, Calendar, ...)
  admin.css                  Extra styles for the admin panel only
js/
  shared/                    Loaded on every page
    config.js                  Settings: Google Sheet ID, tab names, date override. Start here.
    site.js                    Menu behaviour, current-page highlight, small date helpers
    signup-gate.js             Password prompt in front of the sign-up page
    sheets.js                  Reads a tab of the Google Sheet (used by rooms and snacks)
  calendar.js                Performances tab: calendar page, home "Coming up", program tables
  chamber-rooms.js           Chamber Rooms tab: home panel, room assignments, chamber groups list
  snacks.js                  Snacks tab: home panel, snacks page
  signup.js                  Sign-up form (talks to the Google Apps Script)
  our-students.js            Our Students page (reads data/students.json)
  admin-students.js          Admin panel
data/students.json         Student profiles shown on Our Students (written by the admin panel)
images/students/           Student photos (written by the admin panel)
api/save-students.js       Vercel server function that publishes student profiles
google-apps-script/        Source of the Apps Script that receives sign-ups (runs at Google, not here)
docs/                      Guides for maintainers (below)
vercel.json                Vercel settings: the /admin shortcut, and keeping the admin out of search
```

`api/`, `vercel.json` and `index.html` have to be at the root for Vercel and GitHub Pages to find them.

## Guides

- [docs/google-sheet.md](docs/google-sheet.md): the spreadsheet's tabs and columns, and how sign-ups
  reach it. Read this before the start of each year.
- [docs/editing-the-site.md](docs/editing-the-site.md): changing text, adding a page, how links and
  scripts fit together, previewing locally, and the date override for weeks without classes.
- [docs/admin-panel.md](docs/admin-panel.md): managing student profiles.

## Common tasks

| I want to... | Do this |
| --- | --- |
| Change dates, performers, rooms or snacks | Edit the Google Sheet. The site picks it up on the next page load. |
| Start a new school year | Follow "New year checklist" in [docs/google-sheet.md](docs/google-sheet.md). |
| Change text on a page | Edit that page in `html/` (or `index.html`). |
| Change the sign-up page password | `CORRECT_PASSWORD` in `js/shared/signup-gate.js`. |
| Change the admin password | `ADMIN_PASSWORD` in `js/admin-students.js` (see [docs/admin-panel.md](docs/admin-panel.md)). |
| Skip a week without classes on the home page | `todayOverride` in `js/shared/config.js`. |
| Add or edit student profiles | The admin panel, `html/admin/` on the live site. |

## Passwords are not secret

The sign-up and admin passwords are written in the JavaScript, so anyone who opens the browser's
developer tools can read them. They only keep casual visitors out. Do not reuse a password that
protects anything else.
