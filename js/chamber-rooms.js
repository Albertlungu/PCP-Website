// Chamber Rooms Schedule Data and Display Logic

(function() {
    'use strict';

    // Google Sheets API Configuration
    const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
    const API_KEY = 'AIzaSyDYPaPDtcWQDMna_ZIFtofdnNcBSPYS2ys';
    const SHEET_NAME = 'Chamber Rooms';

    // Chamber groups configuration
    const CHAMBER_GROUPS = [
        {
            id: 'augmented-triad',
            name: 'Augmented TRIAD',
            coach: 'David Thies-Thompson',
            members: 'Lafleur/Lungu/Kang',
            color: '#d4af37' // Gold
        },
        {
            id: 'opus-pocus',
            name: 'Opus Pocus Quartet',
            coach: 'Fanny Marks',
            members: 'Pham/Marks/Goncharenko/Stephenson',
            color: '#6d0a2e' // Maroon
        },
        {
            id: 'spiegel',
            name: 'Spiegel Quartet',
            coach: 'Jessy Kim',
            members: 'Yang/Jouini/Melessanakis/van der Sloot',
            color: '#4a90e2' // Blue
        },
        {
            id: 'shoestring',
            name: 'SHOEstring Quartet',
            coach: 'Caren Abramoff',
            members: 'Sone/Sone/Kwan/Marks',
            color: '#8b4789' // Purple
        }
    ];

    // Room assignments will be populated from Google Sheets
    let ROOM_ASSIGNMENTS = [];

    /**
     * Parse spreadsheet data into room assignments
     */
    function parseSheetData(data) {
        const assignments = [];

        // Skip header row (first row)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const dateStr = row[0]; // Column A: Date (YYYY-MM-DD format)
            const room1 = row[1];   // Column B: Augmented TRIAD room
            const room2 = row[2];   // Column C: Opus Pocus room
            const room3 = row[3];   // Column D: Spiegel room
            const room4 = row[4];   // Column E: SHOEstring room

            // Skip empty rows
            if (!dateStr) continue;

            assignments.push({
                date: dateStr,
                rooms: [room1 || '', room2 || '', room3 || '', room4 || '']
            });
        }

        return assignments;
    }

    /**
     * Fetch room assignments from Google Sheets
     */
    async function fetchRoomAssignments() {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

            console.log('[Chamber Rooms] Fetching data from Google Sheets...');
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.values) {
                throw new Error('No data found in spreadsheet');
            }

            ROOM_ASSIGNMENTS = parseSheetData(data.values);
            console.log(`[Chamber Rooms] Successfully loaded ${ROOM_ASSIGNMENTS.length} assignments from Google Sheets`);
            return true;
        } catch (error) {
            console.error('[Chamber Rooms] Error fetching from Google Sheets:', error);
            console.log('[Chamber Rooms] Using empty assignments array');
            ROOM_ASSIGNMENTS = [];
            return false;
        }
    }

    /**
     * Format date string to readable format
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Get today's room assignments
     */
    function getTodaysAssignments() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        return ROOM_ASSIGNMENTS.find(assignment => assignment.date === todayStr);
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
        const upcoming = ROOM_ASSIGNMENTS.filter(assignment => {
            const assignmentDate = new Date(assignment.date + 'T12:00:00');
            const isUpcoming = assignmentDate >= today;
            console.log(`[Chamber Rooms] ${assignment.date}: ${isUpcoming ? 'UPCOMING' : 'past'}`);
            return isUpcoming;
        });

        console.log('[Chamber Rooms] Found', upcoming.length, 'upcoming dates');

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

        if (upcomingDates.length === 0) {
            console.log('[Chamber Rooms] No upcoming dates found - displaying message');
            container.innerHTML = '<div class="no-upcoming-dates">No upcoming chamber sessions scheduled.</div>';
            return;
        }

        console.log('[Chamber Rooms] Rendering', upcomingDates.length, 'upcoming dates');

        let html = '<div class="chamber-rooms-cards">';

        upcomingDates.forEach((assignment, dateIndex) => {
            const isSpecial = assignment.rooms[0] && !assignment.rooms[0].match(/^\d+$/);
            const dateLabel = dateIndex === 0 ? 'Next Session' : dateIndex === 1 ? 'Following' : 'Later';

            html += `<div class="chamber-date-card">`;
            html += `<div class="chamber-date-header">`;
            html += `<span class="date-label">${dateLabel}</span>`;
            html += `<span class="date-value">${formatDate(assignment.date)}</span>`;
            html += `</div>`;

            if (isSpecial) {
                html += `<div class="special-event-card">${assignment.rooms[0]}</div>`;
            } else {
                html += `<div class="chamber-groups-grid">`;
                CHAMBER_GROUPS.forEach((group, index) => {
                    const room = assignment.rooms[index];
                    html += `<div class="chamber-group-assignment" style="border-left: 4px solid ${group.color}">
                                <div class="group-name-mini">${group.name}</div>
                                <div class="room-number-large">Room ${room}</div>
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

        // Check if it's a special event
        const isSpecial = todaysAssignments.rooms[0] && !todaysAssignments.rooms[0].match(/^\d+$/);

        let html = '<div class="chamber-banner" id="chamber-today-banner">';
        html += '<div class="chamber-banner-content">';
        html += '<div class="chamber-banner-header">';
        html += '<span class="chamber-banner-icon">🎵</span>';
        html += '<h2>Chamber Music Today!</h2>';
        html += '<button class="chamber-banner-close" onclick="document.getElementById(\'chamber-today-banner\').style.display=\'none\'">&times;</button>';
        html += '</div>';

        if (isSpecial) {
            html += `<div class="chamber-special-notice">${todaysAssignments.rooms[0]}</div>`;
        } else {
            html += '<div class="chamber-groups-today">';
            CHAMBER_GROUPS.forEach((group, index) => {
                const room = todaysAssignments.rooms[index];
                html += `<div class="chamber-group-card" style="border-left: 5px solid ${group.color}">
                            <div class="group-name-today">${group.name}</div>
                            <div class="room-number-today">Room ${room}</div>
                            <div class="group-members-today">${group.members}</div>
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
        await fetchRoomAssignments();

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
