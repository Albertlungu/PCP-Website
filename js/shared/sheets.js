/**
 * Reading tabs of the program's Google Sheet. Used by js/chamber-rooms.js and js/snacks.js.
 * Needs js/shared/config.js to be loaded first.
 */

const Sheets = (function() {
    'use strict';

    const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    /** All rows of a tab as arrays of strings. Throws if the sheet cannot be read. */
    async function fetchTab(tabName) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SITE.spreadsheetId}/values/${encodeURIComponent(tabName)}?key=${SITE.apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.values) {
            throw new Error(`No data found in the "${tabName}" tab`);
        }
        return data.values;
    }

    function cell(row, index) {
        return ((row && row[index]) || '').toString().trim();
    }

    // The program runs Sept-June; dates without a year belong to the academic year containing today
    function academicStartYear() {
        const today = siteToday();
        return today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
    }

    /** Accepts "Sept 12", "Sept. 12", "Oct 3", "08-Nov", or "10/3/2026" (M/D/YYYY); null otherwise */
    function parseDate(text) {
        if (!text) return null;
        let month, day, year;

        let match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            month = parseInt(match[1], 10) - 1;
            day = parseInt(match[2], 10);
            year = parseInt(match[3], 10);
        } else if ((match = text.match(/^([A-Za-z]+)\.?\s+(\d{1,2})$/))) {
            month = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase());
            day = parseInt(match[2], 10);
        } else if ((match = text.match(/^(\d{1,2})-([A-Za-z]+)$/))) {
            month = MONTHS.indexOf(match[2].slice(0, 3).toLowerCase());
            day = parseInt(match[1], 10);
        } else {
            return null;
        }
        if (month < 0 || month > 11 || !day) return null;
        if (year === undefined) year = month >= 7 ? academicStartYear() : academicStartYear() + 1;

        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    /** Same format as the calendar: "Saturday, October 3" */
    function formatDate(date) {
        return date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    // Sheet values are typed by people, so they are never inserted as raw HTML
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    return { fetchTab, cell, parseDate, formatDate, escapeHtml };
})();
