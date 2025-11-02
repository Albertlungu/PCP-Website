// Chamber Rooms Schedule Data and Display Logic

(function() {
    'use strict';

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

    // Room assignments by date
    const ROOM_ASSIGNMENTS = [
        { date: '2024-09-06', rooms: ['407', '410', '420', '421'] },
        { date: '2024-09-13', rooms: ['421', '407', '410', '420'] },
        { date: '2024-09-20', rooms: ['420', '421', '407', '410'] },
        { date: '2024-09-27', rooms: ['410', '420', '421', '407'] },
        { date: '2024-10-04', rooms: ['407', '410', '420', '421'] },
        { date: '2024-10-11', rooms: ['Thanksgiving', '', '', ''] },
        { date: '2024-10-18', rooms: ['421', '407', '410', '420'] },
        { date: '2024-10-25', rooms: ['420', '421', '407', '410'] },
        { date: '2024-11-01', rooms: ['410', '420', '421', '407'] },
        { date: '2024-11-08', rooms: ['407', '410', '420', '421'] },
        { date: '2024-11-15', rooms: ['421', '407', '410', '420'] },
        { date: '2024-11-22', rooms: ['420', '421', '407', '410'] },
        { date: '2024-11-29', rooms: ['410', '420', '421', '407'] },
        { date: '2024-12-06', rooms: ['407', '410', '420', '421'] },
        { date: '2025-01-10', rooms: ['420', '421', '407', '410'] },
        { date: '2025-01-17', rooms: ['410', '420', '421', '407'] },
        { date: '2025-01-24', rooms: ['407', '410', '420', '421'] },
        { date: '2025-01-31', rooms: ['421', '407', '410', '420'] },
        { date: '2025-02-07', rooms: ['420', '421', '407', '410'] },
        { date: '2025-02-14', rooms: ['Family Day', '', '', ''] },
        { date: '2025-02-21', rooms: ['AUDITION WEEK', '', '', ''] },
        { date: '2025-02-28', rooms: ['407', '410', '420', '421'] },
        { date: '2025-03-07', rooms: ['421', '407', '410', '420'] },
        { date: '2025-03-14', rooms: ['407', '420', '407', '410'] },
        { date: '2025-03-21', rooms: ['410', '420', '421', '407'] },
        { date: '2025-03-28', rooms: ['407', '410', '420', '421'] },
        { date: '2025-04-04', rooms: ['EASTER', '', '', ''] },
        { date: '2025-04-11', rooms: ['421', '407', '410', '420'] },
        { date: '2025-04-18', rooms: ['420', '421', '407', '410'] },
        { date: '2025-04-25', rooms: ['410', '420', '421', '407'] },
        { date: '2025-05-02', rooms: ['407', '410', '420', '421'] }
    ];

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
     * Render chamber rooms table (for dedicated page)
     */
    function renderChamberRoomsTable() {
        const container = document.getElementById('chamber-rooms-table');
        if (!container) return;

        let html = '<div class="chamber-rooms-table-wrapper">';
        html += '<table class="chamber-rooms-table">';

        // Header row with group info
        html += '<thead><tr><th>Date</th>';
        CHAMBER_GROUPS.forEach(group => {
            html += `<th class="group-header" style="border-left: 4px solid ${group.color}">
                        <div class="group-name">${group.name}</div>
                        <div class="group-coach">Coach: ${group.coach}</div>
                        <div class="group-members">${group.members}</div>
                     </th>`;
        });
        html += '</tr></thead>';

        // Body with room assignments
        html += '<tbody>';
        ROOM_ASSIGNMENTS.forEach(assignment => {
            const isSpecial = assignment.rooms[0] && !assignment.rooms[0].match(/^\d+$/);
            html += `<tr class="${isSpecial ? 'special-date' : ''}">`;
            html += `<td class="date-cell">${formatDate(assignment.date)}</td>`;

            if (isSpecial) {
                html += `<td colspan="4" class="special-event">${assignment.rooms[0]}</td>`;
            } else {
                assignment.rooms.forEach((room, index) => {
                    html += `<td class="room-cell" style="border-left: 4px solid ${CHAMBER_GROUPS[index].color}">
                                <span class="room-number">Room ${room}</span>
                             </td>`;
                });
            }
            html += '</tr>';
        });
        html += '</tbody>';

        html += '</table>';
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Render today's assignments banner (for home page)
     */
    function renderTodaysBanner() {
        // Only show on Saturday afternoon
        if (!isSaturdayAfternoon()) {
            return;
        }

        const todaysAssignments = getTodaysAssignments();
        if (!todaysAssignments) {
            return;
        }

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
    function init() {
        // Render table if on chamber rooms page
        renderChamberRoomsTable();

        // Render today's banner if on home page and it's Saturday afternoon
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            renderTodaysBanner();
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
