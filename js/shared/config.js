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
    },

    // Makes the site pick "next Saturday" as if today were this date (YYYY-MM-DD), for weeks without a session
    // (e.g. Thanksgiving). It switches itself off once the real date reaches it, so it never needs
    // removing. Set to '' to always use the real date.
    todayOverride: '2026-10-11'
};

/** Today at midnight, honouring SITE.todayOverride while it is still in the future. */
function siteToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(SITE.todayOverride);
    if (match) {
        const override = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        if (override > today) return override;
    }
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
