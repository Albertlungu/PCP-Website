// Calendar functionality for PCP Website
// Reads the "Performances" tab of the Google Sheet (see js/shared/config.js) and renders it as the
// calendar page, the "Coming up" panel on the home page, and the season tables on the program pages.

// Event data structure
let allEvents = [];
let currentMonth = siteToday().getMonth();
let currentYear = siteToday().getFullYear();
let currentFilter = 'all';
let loadError = false;

// One date format everywhere on the site: "Saturday, October 3"
function formatLongDate(date) {
    return date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Month names
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Sheet values come from public sign-ups, so they must never be injected as raw HTML
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function isBlank(value) {
    const v = (value || '').toString().trim();
    return v === '' || v.toUpperCase() === 'N/A';
}

// The schedule runs Sept-June; read the start year from a title like "2026-27",
// otherwise assume the academic year that contains today (starting in August).
function getAcademicStartYear(data) {
    const title = (data[0] && data[0][0]) || '';
    const match = title.match(/(\d{4})\s*[-–\/]\s*\d{2,4}/);
    if (match) return parseInt(match[1], 10);
    const today = siteToday();
    return today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
}

// Sheet columns: A Date, B Guest Artist, C Remarks, D Student Name, E Instrument, F Piece, G Duration
function parseSheetData(data) {
    const events = [];
    const startYear = getAcademicStartYear(data);
    
    // Skip header rows (title row + column headers)
    for (let i = 2; i < data.length; i++) {
        const row = data[i] || [];
        const dateStr = (row[0] || '').trim();
        
        if (!dateStr || dateStr === 'Date' || dateStr === 'N/A') continue;
        
        // Parse date - format is like "Sept 13", "Oct 4", etc.
        const date = parseDate(dateStr, startYear);
        if (!date) continue;
        
        const guestArtist = (row[1] || '').trim();
        const remarks = (row[2] || '').trim();
        const lowerRemarks = remarks.toLowerCase();
        
        // Determine event type
        let eventType = 'special';
        if (lowerRemarks.includes('masterclass') || lowerRemarks.includes('master class')) {
            eventType = 'masterclass';
        } else if (lowerRemarks.includes('performance class')) {
            eventType = 'performance';
        } else if (!remarks && !isBlank(guestArtist)) {
            // A guest artist with no label is a masterclass
            eventType = 'masterclass';
        }
        
        const event = {
            date: date,
            dateStr: dateStr,
            // Non-class rows (holidays, orientation) reuse this column for notes
            // A room typed after the name ("Jessica Linnebach Room 109") reads better in brackets
            guestArtist: isBlank(guestArtist) || eventType === 'special' ? '' : guestArtist.replace(/\s+(Room\s+\w+)$/i, ' ($1)'),
            performers: [],
            type: eventType,
            remarks: toSentenceCase(remarks)
        };
        
        // Performers are on this row and on the following rows until the next date
        let j = i;
        do {
            const performerRow = data[j] || [];
            const name = (performerRow[3] || '').trim();
            if (!isBlank(name)) {
                // "Hayato sone (waiting list)": the bracketed status is shown apart from the name
                const note = name.match(/\s*\(([^)]*)\)\s*$/);
                event.performers.push({
                    name: capitalizeName(note ? name.slice(0, note.index) : name),
                    note: note ? note[1].trim().toLowerCase() : '',
                    instrument: (performerRow[4] || '').trim(),
                    piece: (performerRow[5] || '').trim(),
                    duration: formatDuration(performerRow[6])
                });
            }
            j++;
        } while (j < data.length && !((data[j] || [])[0] || '').trim());
        i = j - 1;
        
        // Dates with nothing scheduled yet are placeholders in the sheet
        if (!event.remarks && !event.guestArtist && event.performers.length === 0) continue;
        
        if (!event.remarks) {
            event.remarks = eventType === 'masterclass' ? 'Masterclass' : 'Event';
        }
        
        events.push(event);
    }
    
    return events;
}

// The sheet uses Title Case ("Violin Masterclass", "Happy Thanksgiving (No Classes)"); the site uses sentence case
const SENTENCE_CASE_WORDS = new Set(['masterclass', 'masterclasses', 'master', 'class', 'classes', 'performance', 'performances',
    'recital', 'concert', 'chamber', 'music', 'no', 'and', 'of', 'the', 'day', 'orientation', 'rehearsal', 'final']);

function toSentenceCase(text) {
    return text.split(' ').map((word, index) => {
        const bare = word.replace(/^\W+|\W+$/g, '').toLowerCase();
        return index > 0 && SENTENCE_CASE_WORDS.has(bare) ? word.toLowerCase() : word;
    }).join(' ');
}

// Capitalize surnames typed in lowercase ("sone"); short particles like "van" and "der" are left alone
function capitalizeName(name) {
    return name.trim().split(/\s+/).map(word =>
        word.length > 3 && word === word.toLowerCase() ? word[0].toUpperCase() + word.slice(1) : word
    ).join(' ');
}

function performerNote(performer) {
    return performer.note ? ` <span class="performer-note">${escapeHtml(performer.note)}</span>` : '';
}

// Durations are entered as plain minutes ("10", "9.5") or as 12' 30''
function formatDuration(value) {
    const v = (value || '').toString().trim();
    if (isBlank(v)) return '';
    return /^\d+(\.\d+)?$/.test(v) ? `${v} min` : v;
}

// Parse date string like "Sept 13" to Date object within the academic year
function parseDate(dateStr, startYear) {
    const monthMap = {
        'jan': 0, 'january': 0,
        'feb': 1, 'february': 1,
        'mar': 2, 'march': 2,
        'apr': 3, 'april': 3,
        'may': 4,
        'jun': 5, 'june': 5,
        'jul': 6, 'july': 6,
        'aug': 7, 'august': 7,
        'sep': 8, 'sept': 8, 'september': 8,
        'oct': 9, 'october': 9,
        'nov': 10, 'november': 10,
        'dec': 11, 'december': 11
    };
    
    const parts = dateStr.trim().toLowerCase().replace('.', '').split(/\s+/);
    if (parts.length < 2) return null;
    
    const month = monthMap[parts[0]];
    const day = parseInt(parts[1]);
    
    if (month === undefined || isNaN(day)) return null;
    
    // August-December belong to the start year, January-July to the next
    const year = month >= 7 ? startYear : startYear + 1;
    return new Date(year, month, day);
}

// Fetch events from Google Sheets API
async function fetchEvents() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SITE.spreadsheetId}/values/${encodeURIComponent(SITE.tabs.performances)}?key=${SITE.apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.values) {
            throw new Error('No data found in spreadsheet');
        }

        allEvents = parseSheetData(data.values);
        console.log(`Successfully loaded ${allEvents.length} events from Google Sheets`);
    } catch (error) {
        console.error('Error fetching events from Google Sheets:', error);
        allEvents = [];
        loadError = true;
    }
    return allEvents;
}

// Render calendar
function renderCalendar(month, year) {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('current-month-year');
    
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    
    if (loadError) {
        calendarGrid.innerHTML = '<div class="no-events" style="grid-column: 1 / -1;">The schedule could not be loaded right now. Please try again later.</div>';
        return;
    }
    
    // Clear previous calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Check if this day has events
        const dayEvents = allEvents.filter(event => 
            event.date.getDate() === day && 
            event.date.getMonth() === month && 
            event.date.getFullYear() === year &&
            (currentFilter === 'all' || event.type === currentFilter)
        );
        
        if (dayEvents.length > 0) {
            dayCell.classList.add('has-event');
            
            dayEvents.forEach(event => {
                const eventDot = document.createElement('div');
                eventDot.className = `event-indicator ${event.type}`;
                eventDot.title = event.remarks;
                dayCell.appendChild(eventDot);
                
                // Short text label for wider screens (hidden on phones via CSS)
                const eventLabel = document.createElement('div');
                eventLabel.className = `event-label ${event.type}`;
                eventLabel.textContent = event.remarks;
                dayCell.appendChild(eventLabel);
            });
            
            dayCell.addEventListener('click', () => showEventDetails(dayEvents));
        }
        
        // Highlight today
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayCell.classList.add('today');
        }
        
        calendarGrid.appendChild(dayCell);
    }

    // Fill out the last week so the grid's rules close evenly
    const trailing = (7 - ((firstDay + daysInMonth) % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }
}

// Render list view
function renderListView() {
    const listView = document.getElementById('list-view');
    listView.innerHTML = '';

    const today = siteToday();

    // Filter and sort events - show only future events
    const filteredEvents = allEvents.filter(event => {
        const isCorrectType = currentFilter === 'all' || event.type === currentFilter;
        const isFuture = event.date >= today;
        return isCorrectType && isFuture;
    }).sort((a, b) => a.date - b.date);
    
    if (filteredEvents.length === 0) {
        listView.innerHTML = loadError
            ? '<div class="no-events">The schedule could not be loaded right now. Please try again later.</div>'
            : '<div class="no-events">No events found</div>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-list-card ${event.type}`;
        
        const eventDate = document.createElement('div');
        eventDate.className = 'event-date';
        eventDate.textContent = formatLongDate(event.date);
        
        const eventInfo = document.createElement('div');
        eventInfo.className = 'event-info';
        
        let performersHTML = '';
        if (event.performers.length > 0) {
            performersHTML = '<div class="event-performers">';
            event.performers.forEach(performer => {
                performersHTML += `
                    <div class="performer-item">
                        <strong>${escapeHtml(performer.name)}</strong>${performer.instrument ? ` &ndash; ${escapeHtml(performer.instrument)}` : ''}${performerNote(performer)}
                        ${performer.piece ? `<br><em>${escapeHtml(performer.piece)}</em>` : ''}${performer.duration ? `&nbsp;<span class="duration">${escapeHtml(performer.duration)}</span>` : ''}
                    </div>
                `;
            });
            performersHTML += '</div>';
        }
        
        eventInfo.innerHTML = `
            <div class="event-title">${escapeHtml(event.remarks)}</div>
            ${event.guestArtist ? `<div class="event-guest">${event.type === 'masterclass' ? 'Guest artist: ' : ''}${escapeHtml(event.guestArtist)}</div>` : ''}
            ${performersHTML}
        `;
        
        eventCard.appendChild(eventDate);
        eventCard.appendChild(eventInfo);
        eventCard.addEventListener('click', () => showEventDetails([event]));
        
        listView.appendChild(eventCard);
    });
}

// Show event details in modal
function showEventDetails(events) {
    const modal = document.getElementById('event-modal');
    const detailsContainer = document.getElementById('event-details');
    
    let detailsHTML = '';
    
    events.forEach(event => {
        const dateStr = formatLongDate(event.date);
        
        detailsHTML += `
            <div class="event-detail-card ${event.type}">
                <div class="event-detail-header">
                    <h3>${escapeHtml(event.remarks)}</h3>
                    <p class="event-detail-date">${dateStr}</p>
                    ${event.guestArtist ? `<p class="event-detail-guest">${event.type === 'masterclass' ? 'Guest artist: ' : ''}${escapeHtml(event.guestArtist)}</p>` : ''}
                </div>
        `;
        
        if (event.performers.length > 0) {
            detailsHTML += '<div class="event-detail-performers"><h4>Performers</h4><ul>';
            event.performers.forEach(performer => {
                detailsHTML += `
                    <li>
                        <strong>${escapeHtml(performer.name)}</strong>${performer.instrument ? ` &ndash; ${escapeHtml(performer.instrument)}` : ''}${performerNote(performer)}
                        ${performer.piece ? `<br><span class="piece-title">${escapeHtml(performer.piece)}</span>` : ''}${performer.duration ? `&nbsp;<span class="duration">${escapeHtml(performer.duration)}</span>` : ''}
                    </li>
                `;
            });
            detailsHTML += '</ul></div>';
        }
        
        detailsHTML += '</div>';
    });
    
    detailsContainer.innerHTML = detailsHTML;
    modal.style.display = 'flex';
}

// Initialize calendar
// Home page: the next upcoming event, with its performers
function renderNextEvent(container) {
    const MAX_PERFORMERS = 6;
    const today = siteToday();
    const next = allEvents
        .filter(event => event.date >= today)
        .sort((a, b) => a.date - b.date)[0];

    let html = '<h2 class="next-event-heading">Coming up</h2>';
    if (loadError) {
        container.innerHTML = html + `<p class="next-event-more">The schedule could not be loaded right now. <a href="${sitePath('html/participate/calendar.html')}">Open the calendar</a></p>`;
        return;
    }
    if (!next) {
        container.innerHTML = html + `<p class="next-event-more">Nothing scheduled yet. <a href="${sitePath('html/participate/calendar.html')}">Open the calendar</a></p>`;
        return;
    }

    const date = formatLongDate(next.date);
    const relative = relativeDay(next.date);
    html += `<p class="next-event-date">${escapeHtml(date)}${relative ? ` <span class="relative-day">${relative}</span>` : ''}</p>`;
    html += `<p class="next-event-title">${escapeHtml(next.remarks)}${next.guestArtist && next.type === 'masterclass' ? ` with ${escapeHtml(next.guestArtist)}` : ''}</p>`;

    if (next.performers.length) {
        html += '<ul class="next-event-performers">';
        next.performers.slice(0, MAX_PERFORMERS).forEach(performer => {
            html += `<li><span>${escapeHtml(performer.name)}${performerNote(performer)}</span><span>${escapeHtml(performer.instrument)}</span></li>`;
        });
        html += '</ul>';
    }

    const remaining = next.performers.length - MAX_PERFORMERS;
    html += `<p class="next-event-more">${remaining > 0 ? `and ${remaining} more. ` : ''}<a href="${sitePath('html/participate/calendar.html')}">Full program in the calendar</a></p>`;
    container.innerHTML = html;
}

// A table of this year's dates, optionally limited to one event type (data-season on the container)
function renderSeasonTable(container) {
    if (loadError) {
        container.innerHTML = `<p class="no-events">The schedule could not be loaded right now. <a href="${sitePath('html/participate/calendar.html')}">Try the calendar</a>.</p>`;
        return;
    }
    const kind = container.dataset.season;
    const events = allEvents
        .filter(event => kind === 'all' || event.type === kind)
        .sort((a, b) => a.date - b.date);
    if (!events.length) {
        container.innerHTML = '<p class="no-events">No dates have been scheduled yet.</p>';
        return;
    }

    const today = siteToday();
    const next = events.find(event => event.date >= today);
    const showGuest = kind !== 'performance';
    const columns = showGuest ? 4 : 3;
    let html = '<table class="season-table"><thead><tr><th scope="col">Date</th><th scope="col">' +
        (kind === 'all' ? 'What is on' : 'Class') + '</th>' +
        (showGuest ? '<th scope="col">Guest artist</th>' : '') +
        '<th scope="col" class="num">Performers</th></tr></thead><tbody>';
    events.forEach((event, index) => {
        const classes = [];
        if (event.date < today) classes.push('past');
        if (event === next) classes.push('is-next');
        const programmeId = `programme-${kind}-${index}`;
        const hasProgramme = event.performers.length > 0;
        if (hasProgramme) classes.push('has-programme');

        const relative = event === next ? relativeDay(event.date) : '';
        const title = hasProgramme
            ? `<button type="button" class="programme-toggle" aria-expanded="false" aria-controls="${programmeId}">${escapeHtml(event.remarks)}</button>`
            : escapeHtml(event.remarks);
        html += `<tr${classes.length ? ` class="${classes.join(' ')}"` : ''}>` +
            `<td>${escapeHtml(formatLongDate(event.date))}${event === next ? ` <span class="next-label">${relative || 'next'}</span>` : ''}</td>` +
            `<td>${title}</td>` +
            (showGuest ? `<td>${escapeHtml(event.guestArtist || '')}</td>` : '') +
            `<td class="num">${event.performers.length || ''}</td></tr>`;

        if (hasProgramme) {
            html += `<tr class="programme-row" id="${programmeId}" hidden><td colspan="${columns}"><ol class="programme">`;
            event.performers.forEach(performer => {
                html += `<li><span class="programme-player">${escapeHtml(performer.name)}${performer.instrument ? `, ${escapeHtml(performer.instrument.toLowerCase())}` : ''}${performerNote(performer)}</span>` +
                    `<span class="programme-piece">${escapeHtml(performer.piece)}${performer.duration ? `&nbsp;<span class="duration">${escapeHtml(performer.duration)}</span>` : ''}</span></li>`;
            });
            html += '</ol></td></tr>';
        }
    });
    html += '</tbody></table>';
    container.innerHTML = html;

    // A click anywhere on a row opens its programme; the button inside keeps it keyboard accessible
    container.querySelectorAll('tr.has-programme').forEach(row => {
        const toggle = row.querySelector('.programme-toggle');
        const programme = document.getElementById(toggle.getAttribute('aria-controls'));
        row.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(open));
            row.classList.toggle('is-open', open);
            programme.hidden = !open;
        });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const seasonTables = document.querySelectorAll('[data-season]');
    if (seasonTables.length) {
        await fetchEvents();
        seasonTables.forEach(renderSeasonTable);
    }

    const nextEvent = document.getElementById('next-event');
    if (nextEvent) {
        await fetchEvents();
        renderNextEvent(nextEvent);
    }

    if (!document.getElementById('calendar-grid')) return;

    // Fetch events
    await fetchEvents();

    // Set default view to list and show it
    document.getElementById('calendar-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'flex';
    renderListView();

    // Initial render (for when user switches to calendar view)
    renderCalendar(currentMonth, currentYear);
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    // View toggle
    const viewButtons = document.querySelectorAll('.calendar-view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            withViewTransition(() => {
                if (view === 'calendar') {
                    // The filter may have changed while the list was showing
                    renderCalendar(currentMonth, currentYear);
                    document.getElementById('calendar-view').style.display = 'block';
                    document.getElementById('list-view').style.display = 'none';
                } else {
                    document.getElementById('calendar-view').style.display = 'none';
                    document.getElementById('list-view').style.display = 'flex';
                    renderListView();
                }
            });
        });
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            
            // Re-render current view
            const activeView = document.querySelector('.calendar-view-btn.active').dataset.view;
            withViewTransition(() => {
                if (activeView === 'calendar') {
                    renderCalendar(currentMonth, currentYear);
                } else {
                    renderListView();
                }
            });
        });
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', function() {
        document.getElementById('event-modal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    document.getElementById('event-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('event-modal').style.display = 'none';
        }
    });
});
