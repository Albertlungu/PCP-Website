// Chamber Rooms Schedule Data and Display Logic

(function() {
    'use strict';

    // Google Sheets API Configuration
    const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
    const API_KEY = 'AIzaSyDYPaPDtcWQDMna_ZIFtofdnNcBSPYS2ys';
    const SHEET_NAME = 'Chamber Rooms';

    // Colors for groups, in sheet column order
    const GROUP_COLORS = ['#d4af37', '#d6457a', '#4a90e2', '#8b4789', '#3fb68b', '#e67e22'];

    // Groups (coach + members) are read from the sheet each year
    let CHAMBER_GROUPS = [];

    // Room assignments will be populated from Google Sheets
    let ROOM_ASSIGNMENTS = [];
    let loadSucceeded = false;

    // The visitor's own group, remembered on this device; keyed by the member list so a new year starts fresh
    const MY_GROUP_KEY = 'pcp-my-group';

    function getMyGroup() {
        try {
            return localStorage.getItem(MY_GROUP_KEY) || '';
        } catch (error) {
            return '';
        }
    }

    function setMyGroup(members) {
        try {
            if (members) localStorage.setItem(MY_GROUP_KEY, members);
            else localStorage.removeItem(MY_GROUP_KEY);
        } catch (error) {
            // Storage blocked (private mode): the highlight just won't be remembered
        }
    }

    function isMine(group) {
        return group.members === getMyGroup();
    }

    function groupPicker() {
        const mine = getMyGroup();
        let html = '<label class="group-picker">Highlight my group <select data-group-picker><option value="">None</option>';
        CHAMBER_GROUPS.forEach(group => {
            html += `<option value="${escapeHtml(group.members)}"${group.members === mine ? ' selected' : ''}>${escapeHtml(group.members)}</option>`;
        });
        return html + '</select></label>';
    }

    // One row of the room list, shared by the home page and the room assignments page
    function roomRow(group, room) {
        const mine = isMine(group);
        return `<li class="${mine ? 'is-mine' : ''}" style="border-left-color: ${group.color}">` +
            `<span class="week-room">${room ? escapeHtml(room) : 'TBA'}</span>` +
            `<span class="week-group">${escapeHtml(group.members)}${mine ? '<span class="sr-only"> (your group)</span>' : ''}` +
            `<span class="week-coach">${escapeHtml(group.coach)}</span></span></li>`;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function cell(row, index) {
        return ((row && row[index]) || '').toString().trim();
    }

    /**
     * Parse the "Chamber Rooms" tab.
     * Layout: a "Coach" header row followed by the coach names, a "Groups" row with members,
     * then one row per Saturday: date in column A and each group's room in columns B onward.
     * A non-numeric value in column B (e.g. "Thanksgiving") marks a day without chamber.
     */
    function parseSheetData(data) {
        const coachHeader = data.findIndex(row => cell(row, 1).toLowerCase() === 'coach');
        const coaches = coachHeader >= 0 ? (data[coachHeader + 1] || []) : [];
        const groupsRow = data.find(row => cell(row, 0).toLowerCase() === 'groups') || [];

        const groupCount = Math.max(coaches.length, groupsRow.length) - 1;
        CHAMBER_GROUPS = [];
        for (let i = 1; i <= groupCount; i++) {
            if (!cell(coaches, i) && !cell(groupsRow, i)) continue;
            CHAMBER_GROUPS.push({
                column: i,
                coach: cell(coaches, i),
                members: cell(groupsRow, i).split('/').map(name => name.trim()).filter(Boolean).join(' / '),
                color: GROUP_COLORS[(i - 1) % GROUP_COLORS.length]
            });
        }

        const startYear = getAcademicStartYear();
        const assignments = [];
        data.forEach(row => {
            const date = parseSheetDate(cell(row, 0), startYear);
            if (!date) return;
            assignments.push({
                date: date,
                rooms: CHAMBER_GROUPS.map(group => cell(row, group.column)),
                note: cell(row, 1)
            });
        });
        return assignments;
    }

    // The program runs Sept-June; dates without a year belong to the academic year containing today
    function getAcademicStartYear() {
        const today = new Date();
        return today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
    }

    const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    /** Accepts "Sept 12", "Oct 3", "08-Nov", or "10/3/2026" (M/D/YYYY) */
    function parseSheetDate(text, startYear) {
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
        if (year === undefined) year = month >= 7 ? startYear : startYear + 1;

        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Fetch room assignments from Google Sheets
     */
    async function fetchRoomAssignments() {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.values) {
                throw new Error('No data found in spreadsheet');
            }
            ROOM_ASSIGNMENTS = parseSheetData(data.values);
            return true;
        } catch (error) {
            console.error('[Chamber Rooms] Error fetching from Google Sheets:', error);
            ROOM_ASSIGNMENTS = [];
            return false;
        }
    }

    function formatDate(date) {
        // Same format as the calendar: "Saturday, October 3"
        return date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    /** Rows like "Thanksgiving" or "NO CLASSES" have text instead of a room number */
    function getSpecialNote(assignment) {
        return assignment.note && !/^\d+$/.test(assignment.note) ? assignment.note : '';
    }

    /**
     * Get upcoming dates (current/next and up to 2 more)
     */
    function getUpcomingDates() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('[Chamber Rooms] Getting upcoming dates...');
        console.log('[Chamber Rooms] Today:', today.toISOString().split('T')[0]);
        console.log('[Chamber Rooms] Total assignments in data:', ROOM_ASSIGNMENTS.length);

        // Find assignments from today onward
        const upcoming = ROOM_ASSIGNMENTS.filter(assignment => assignment.date >= today);

        // Return first 3 upcoming dates (or less if not available)
        return upcoming.slice(0, 3);
    }

    /**
     * Render chamber rooms table (for dedicated page)
     */
    function renderChamberRoomsTable() {
        console.log('[Chamber Rooms] Rendering chamber rooms table...');
        const container = document.getElementById('chamber-rooms-table');
        if (!container) {
            console.log('[Chamber Rooms] Container #chamber-rooms-table not found');
            return;
        }

        const upcomingDates = getUpcomingDates();

        if (!loadSucceeded) {
            container.innerHTML = '<div class="no-upcoming-dates">Room assignments could not be loaded right now. Please try again later.</div>';
            return;
        }

        if (upcomingDates.length === 0) {
            console.log('[Chamber Rooms] No upcoming dates found - displaying message');
            container.innerHTML = '<div class="no-upcoming-dates">No upcoming chamber sessions scheduled.</div>';
            return;
        }

        console.log('[Chamber Rooms] Rendering', upcomingDates.length, 'upcoming dates');

        let html = '<div class="chamber-rooms-cards">';

        upcomingDates.forEach((assignment, dateIndex) => {
            const note = getSpecialNote(assignment);
            const hasRooms = assignment.rooms.some(room => /^\d+$/.test(room));

            html += `<div class="chamber-date-card">`;
            html += `<div class="chamber-date-header">`;
            html += `<span class="date-value">${formatDate(assignment.date)}</span>`;
            const relative = relativeDay(assignment.date);
            if (relative || dateIndex === 0) html += `<span class="date-label">${relative || 'Next session'}</span>`;
            html += `</div>`;

            if (note) {
                html += `<div class="special-event-card">${escapeHtml(note)}</div>`;
            } else if (!hasRooms) {
                html += `<div class="special-event-card">Rooms to be announced</div>`;
            } else {
                // Same layout as the home page list; the stripe keeps each group's colour from week to week
                html += '<ul class="week-rooms-list chamber-rooms-list">';
                CHAMBER_GROUPS.forEach((group, index) => {
                    html += roomRow(group, assignment.rooms[index]);
                });
                html += '</ul>';
            }

            html += `</div>`;
        });

        html += '</div>';

        container.innerHTML = groupPicker() + html;
    }

    /**
     * This year's groups and coaches (Chamber music page)
     */
    function renderChamberGroups() {
        const container = document.getElementById('chamber-groups');
        if (!container) return;
        if (!loadSucceeded || !CHAMBER_GROUPS.length) {
            container.innerHTML = '<p class="no-events">The group list could not be loaded right now.</p>';
            return;
        }
        let html = '<table class="season-table"><thead><tr><th scope="col">Group</th><th scope="col">Coach</th></tr></thead><tbody>';
        CHAMBER_GROUPS.forEach(group => {
            html += `<tr${isMine(group) ? ' class="is-mine"' : ''}><td>${escapeHtml(group.members)}</td><td>${escapeHtml(group.coach)}</td></tr>`;
        });
        container.innerHTML = html + '</tbody></table>';
    }

    /**
     * Home page: rooms for the next session (today, if it is a Saturday with chamber)
     */
    function renderWeekRooms() {
        const container = document.getElementById('week-rooms');
        if (!container) return;

        let html = '<h2 class="week-rooms-heading">Chamber rooms</h2>';
        const next = getUpcomingDates()[0];
        if (!loadSucceeded || !next) {
            html += `<p class="week-rooms-note">${loadSucceeded ? 'No sessions are scheduled.' : 'Room assignments could not be loaded right now.'}</p>`;
            container.innerHTML = html + '<p class="week-rooms-more"><a href="chamber-rooms.html">Room assignments</a></p>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = next.date.getTime() === today.getTime();
        const relative = relativeDay(next.date);
        html += `<p class="week-rooms-date">${isToday ? 'Today, ' : ''}${escapeHtml(formatDate(next.date))}` +
            `${relative && !isToday ? ` <span class="relative-day">${relative}</span>` : ''}</p>`;

        const note = getSpecialNote(next);
        if (note) {
            html += `<p class="week-rooms-note">${escapeHtml(note)}: no chamber coaching.</p>`;
        } else {
            html += '<ul class="week-rooms-list">';
            CHAMBER_GROUPS.forEach((group, index) => {
                html += roomRow(group, next.rooms[index]);
            });
            html += '</ul>';
        }
        container.innerHTML = html + '<div class="week-rooms-more"><a href="chamber-rooms.html">All weeks</a>' +
            (note ? '' : groupPicker()) + '</div>';
    }

    function renderAll() {
        renderChamberRoomsTable();
        renderChamberGroups();
        renderWeekRooms();
    }

    /**
     * Initialize chamber rooms functionality
     */
    async function init() {
        console.log('[Chamber Rooms] Initializing...');
        console.log('[Chamber Rooms] Current path:', window.location.pathname);

        // Fetch room assignments from Google Sheets
        loadSucceeded = await fetchRoomAssignments();

        renderAll();

        // Choosing a group re-renders every list on the page with that group highlighted
        document.addEventListener('change', event => {
            if (!event.target.matches('[data-group-picker]')) return;
            setMyGroup(event.target.value);
            renderAll();
            document.querySelector('[data-group-picker]')?.focus();
        });
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
