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
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    /** Rows like "Thanksgiving" or "NO CLASSES" have text instead of a room number */
    function getSpecialNote(assignment) {
        return assignment.note && !/^\d+$/.test(assignment.note) ? assignment.note : '';
    }

    /**
     * Get today's room assignments
     */
    function getTodaysAssignments() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return ROOM_ASSIGNMENTS.find(assignment => assignment.date.getTime() === today.getTime());
    }

    /**
     * Check if it's Saturday between 12pm and 6pm
     */
    function isSaturdayAfternoon() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();

        return day === 6 && hour >= 12 && hour < 18;
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
            const dateLabel = dateIndex === 0 ? 'Next Session' : dateIndex === 1 ? 'Following' : 'Later';

            html += `<div class="chamber-date-card">`;
            html += `<div class="chamber-date-header">`;
            html += `<span class="date-label">${dateLabel}</span>`;
            html += `<span class="date-value">${formatDate(assignment.date)}</span>`;
            html += `</div>`;

            if (note) {
                html += `<div class="special-event-card">${escapeHtml(note)}</div>`;
            } else if (!hasRooms) {
                html += `<div class="special-event-card">Rooms to be announced</div>`;
            } else {
                html += `<div class="chamber-groups-grid">`;
                CHAMBER_GROUPS.forEach((group, index) => {
                    const room = assignment.rooms[index];
                    html += `<div class="chamber-group-assignment" style="border-left: 4px solid ${group.color}">
                                <div class="group-name-mini">${escapeHtml(group.members)}</div>
                                <div class="group-coach">Coach: ${escapeHtml(group.coach)}</div>
                                <div class="room-number-large">${room ? `Room ${escapeHtml(room)}` : 'TBA'}</div>
                             </div>`;
                });
                html += `</div>`;
            }

            html += `</div>`;
        });

        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Render today's assignments banner (for home page)
     */
    function renderTodaysBanner() {
        console.log('[Chamber Rooms] Checking if today\'s banner should be shown...');

        // Only show on Saturday afternoon
        if (!isSaturdayAfternoon()) {
            console.log('[Chamber Rooms] Not Saturday afternoon - skipping banner');
            return;
        }

        console.log('[Chamber Rooms] It\'s Saturday afternoon - checking for today\'s assignments');
        const todaysAssignments = getTodaysAssignments();
        if (!todaysAssignments) {
            console.log('[Chamber Rooms] No assignments for today');
            return;
        }

        console.log('[Chamber Rooms] Found today\'s assignments:', todaysAssignments);

        const note = getSpecialNote(todaysAssignments);

        let html = '<div class="chamber-banner" id="chamber-today-banner">';
        html += '<div class="chamber-banner-content">';
        html += '<div class="chamber-banner-header">';
        html += '<h2>Chamber Music Today</h2>';
        html += '<button class="chamber-banner-close" aria-label="Close" onclick="document.getElementById(\'chamber-today-banner\').style.display=\'none\'">&times;</button>';
        html += '</div>';

        if (note) {
            html += `<div class="chamber-special-notice">${escapeHtml(note)}</div>`;
        } else {
            html += '<div class="chamber-groups-today">';
            CHAMBER_GROUPS.forEach((group, index) => {
                const room = todaysAssignments.rooms[index];
                html += `<div class="chamber-group-card" style="border-left: 5px solid ${group.color}">
                            <div class="group-name-today">${escapeHtml(group.members)}</div>
                            <div class="room-number-today">${room ? `Room ${escapeHtml(room)}` : 'TBA'}</div>
                            <div class="group-members-today">Coach: ${escapeHtml(group.coach)}</div>
                         </div>`;
            });
            html += '</div>';
        }

        html += '<a href="chamber-rooms.html" class="chamber-banner-link">View Full Schedule →</a>';
        html += '</div>';
        html += '</div>';

        // Insert banner after hero section on home page
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.insertAdjacentHTML('afterend', html);
        }
    }

    /**
     * Initialize chamber rooms functionality
     */
    async function init() {
        console.log('[Chamber Rooms] Initializing...');
        console.log('[Chamber Rooms] Current path:', window.location.pathname);

        // Fetch room assignments from Google Sheets
        loadSucceeded = await fetchRoomAssignments();

        // Render table if on chamber rooms page
        renderChamberRoomsTable();

        // Render today's banner if on home page and it's Saturday afternoon
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            console.log('[Chamber Rooms] On home page - checking for banner');
            renderTodaysBanner();
        } else {
            console.log('[Chamber Rooms] Not on home page - skipping banner');
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally if needed
    window.chamberRooms = {
        getTodaysAssignments,
        isSaturdayAfternoon
    };
})();
