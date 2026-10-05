/**
 * Site-wide settings and helpers. Loaded first on every page, before any other script.
 *
 * Everything a maintainer is likely to change from year to year lives in SITE below.
 * See docs/google-sheet.md for how each tab of the spreadsheet must be laid out.
 */

const SITE = {
    // The program's Google Sheet. The calendar, room assignments and snacks pages all read from it.
    spreadsheetId: '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68',
    // Public, read-only Google Sheets API key (Google Cloud project "pcp-website-475812")
    apiKey: 'AIzaSyDYPaPDtcWQDMna_ZIFtofdnNcBSPYS2ys',
    tabs: {
        performances: 'Performances',
        chamberRooms: 'Chamber Rooms',
        snacks: 'Snacks'
    }
};

/** Today at midnight, for comparing against dates read from the sheet. */
function siteToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

// The site root, worked out from this file's own address (js/shared/config.js). The site is served
// both at a domain root (Vercel) and under /PCP-Website/ (GitHub Pages), so links built in
// JavaScript cannot start with "/".
const SITE_ROOT = new URL('../../', document.currentScript.src);

/** Absolute URL for a path relative to the repository root, e.g. sitePath('data/students.json'). */
function sitePath(path) {
    return new URL(path, SITE_ROOT).href;
}
