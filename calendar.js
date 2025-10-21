// Calendar functionality for PCP Website
// This reads from the Google Sheets and displays events in a calendar format

const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
const API_KEY = 'AIzaSyDYPaPDtcWQDMna_ZIFtofdnNcBSPYS2ys'; // I updated with my API key
const SHEET_NAME = 'Sheet1';

// Event data structure
let allEvents = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentFilter = 'all';

// Month names
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Parse the spreadsheet data into events
function parseSheetData(data) {
    const events = [];
    
    // Skip header rows (first 2 rows)
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        const dateStr = row[0]; // Column A: Date
        const guestArtist = row[1]; // Column B: Guest Artist
        const name = row[2]; // Column C: Name
        const instrument = row[3]; // Column D: Instrument
        const piece = row[4]; // Column E: Piece
        const duration = row[5]; // Column F: Duration
        const remarks = row[6]; // Column G: Remarks
        
        // Skip empty rows or special rows
        if (!dateStr || dateStr === 'Date' || dateStr === 'N/A') continue;
        
        // Parse date - format is like "Sept 13", "Oct 4", etc.
        const date = parseDate(dateStr, currentYear);
        if (!date) continue;
        
        // Determine event type
        let eventType = 'performance';
        if (remarks && remarks.toLowerCase().includes('masterclass')) {
            eventType = 'masterclass';
        } else if (remarks && remarks.toLowerCase().includes('performance class')) {
            eventType = 'performance';
        } else if (remarks && (remarks.toLowerCase().includes('thanksgiving') || 
                               remarks.toLowerCase().includes('rehearsal') || 
                               remarks.toLowerCase().includes('improvisation'))) {
            eventType = 'special';
        }
        
        // Create event object
        const event = {
            date: date,
            dateStr: dateStr,
            guestArtist: guestArtist || 'TBA',
            performers: [],
            type: eventType,
            remarks: remarks || ''
        };
        
        // Add performer if exists
        if (name && name !== 'N/A') {
            event.performers.push({
                name: name,
                instrument: instrument || '',
                piece: piece || '',
                duration: duration || ''
            });
            
            // Check for multiple performers in same date (next rows)
            let j = i + 1;
            while (j < data.length && (!data[j][0] || data[j][0] === '')) {
                if (data[j][2] && data[j][2] !== 'N/A') {
                    event.performers.push({
                        name: data[j][2],
                        instrument: data[j][3] || '',
                        piece: data[j][4] || '',
                        duration: data[j][5] || ''
                    });
                }
                j++;
            }
            i = j - 1; // Skip the rows we've already processed
        }
        
        events.push(event);
    }
    
    return events;
}

// Parse date string like "Sept 13" to Date object
function parseDate(dateStr, year) {
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
    
    const parts = dateStr.trim().toLowerCase().split(' ');
    if (parts.length < 2) return null;
    
    const month = monthMap[parts[0]];
    const day = parseInt(parts[1]);
    
    if (month === undefined || isNaN(day)) return null;
    
    return new Date(year, month, day);
}

// Helper function to format guest artist display
function formatGuestArtist(guestArtist) {
    if (guestArtist && guestArtist.toUpperCase() === 'HOST') {
        return 'Performance Class';
    }
    return guestArtist || 'TBA';
}

// Fetch events from Google Sheets API
async function fetchEvents() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

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
        return allEvents;
    } catch (error) {
        console.error('Error fetching events from Google Sheets:', error);

        // Fallback to hardcoded data if API fails
        console.log('Falling back to hardcoded data...');
        const hardcodedData = [
            ['Date', 'Guest Artist', 'Name', 'Instrument', 'Piece', 'Duration', 'Remarks'],
            ['uOttawa PC Performance Class Schedule', '', '', '', '', '', ''],
            ['Sept 13', 'Rachel Mercer', 'N/A', 'N/A', 'N/A', 'N/A', 'Chamber Rehearsal Technique'],
            ['Sept 20', 'Abramoff', 'N/A', 'N/A', 'N/A', 'N/A', 'Improvisation Technique'],
            ['Sept 27', 'Chooi', 'Philippe Lafleur', 'Violin', 'Mendelssohn Violin Concerto, E minor, first movement', '14\' 00\'\'', 'Violin Masterclass'],
            ['', '', 'Vincent Pham', 'Violin', 'Sibelius Violin Concerto, D minor, first movement (1st half)', '17\' 30\'\'', ''],
            ['', '', 'Sakura Sone', 'Violin', 'Wieniawski Scherzo-Tarantelle', '5\' 00\'\'', ''],
            ['Oct 4', 'Harrison', 'Noah & Ella Marks', 'Violin & Cello', 'Brahms Concerto for Violin and Cello, A Minor, first movement', '18\' 00\'\'', 'Cello Masterclass'],
            ['', '', 'Josie van der Sloot', 'Cello', 'Haydn Cello Concerto, C Major, first movement', '8\' 00\'\'', ''],
            ['', '', 'Jacob Kang', 'Cello', 'Bach Cello Suite #5, C minor, Prelude', '5\' 30\'\'', ''],
            ['Oct 11', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Thanksgiving'],
            ['Oct 18', 'HOST', 'Vincent Pham', 'Violin', 'Sibelius Violin Concerto, D minor, first movement', '14\'00"', 'Performance Class'],
            ['', '', 'Henrik Stephenson', 'Cello', 'Elgar Cello Concerto, E minor, first movement', '8\'00\'\'', ''],
            ['', '', 'Abigail Goncharenko', 'Violin', 'Mozart Violin Concerto # 4, D Major, first movement', '8\'30\'\'', ''],
            ['', '', 'Philippe Lafleur', 'Violin', 'Mendelssohn Violin Concerto, E minor, first movement', '14\' 00\'\'', ''],
            ['', '', 'Albert Lungu', 'Viola', 'Bowen Viola Sonata, C minor, first movement', '11\'00\'\'', ''],
            ['', '', 'Opus Pocus Quartet', 'String Quartet', 'Beethoven String Quartet, C Minor, first movement', '10\'00\'\'', ''],
            ['Oct 25', 'van der Sloot', 'Philippe Lafleur', 'Violin', 'Mendelssohn Violin Concerto, E minor, first movement', '14\' 00\'\'', 'Violin/Viola Masterclass'],
            ['', '', 'Hayato Sone', 'Violin', 'Bach Violin Concerto, A minor, first movement', '5\' 00\'\'', ''],
            ['', '', 'Olivia Kwan', 'Violin', 'Mozart concerto # 3, G Major, first movement', '6\' 00\'\'', ''],
            ['Nov 01', 'Jessy Kim', 'Abigail Goncharenko', 'Violin', 'Mozart Violin Concerto # 4, D Major, first movement', '8\'30\'\'', 'Violin Masterclass'],
            ['Nov 8', 'HOST', 'Vincent Pham', 'Violin', 'Paganini 13', '', 'Performance Class'],
            ['Nov 15', 'Mercer', 'Henrik Stephenson', 'Cello', 'Elgar Cello Concerto, E minor, first movement', '8\'00\'\'', 'Cello Masterclass'],
            ['', '', 'Jacob Kang', 'Cello', 'Chopin Cello Sonata, G Minor, first movement', '15\' 00\'\'', ''],
            ['', '', 'Ella Marks', 'Cello', 'Haydn Cello Concerto, C Major, first movement', '7\'00"', ''],
            ['', '', 'Josie van der Sloot', '', '', '', ''],
            ['Nov 22', 'Roseman', 'Vincent Pham', 'Violin', 'Saint Saens Introduction and Rondo Capriccioso', '10\' 00\'\'', 'Violin Masterclass'],
            ['Nov 29', 'Thies-Thompson', '', '', '', '', 'Viola Masterclass'],
            ['Dec 6', 'HOST', 'Vincent Pham', 'Violin', 'Saint Saens Introduction and Rondo Capriccioso', '10\' 00\'\'', 'Performance Class']
        ];

        allEvents = parseSheetData(hardcodedData);
        console.log(`Loaded ${allEvents.length} events from fallback data`);
        return allEvents;
    }
}

// Render calendar
function renderCalendar(month, year) {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('current-month-year');
    
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    
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
        const currentDate = new Date(year, month, day);
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
                eventDot.title = event.remarks || 'Event';
                dayCell.appendChild(eventDot);
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
}

// Render list view
function renderListView() {
    const listView = document.getElementById('list-view');
    listView.innerHTML = '';
    
    // Filter and sort events
    const filteredEvents = allEvents.filter(event => 
        currentFilter === 'all' || event.type === currentFilter
    ).sort((a, b) => a.date - b.date);
    
    if (filteredEvents.length === 0) {
        listView.innerHTML = '<div class="no-events">No events found</div>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-list-card ${event.type}`;
        
        const eventDate = document.createElement('div');
        eventDate.className = 'event-date';
        eventDate.innerHTML = `
            <div class="event-day">${event.date.getDate()}</div>
            <div class="event-month">${monthNames[event.date.getMonth()].slice(0, 3)}</div>
        `;
        
        const eventInfo = document.createElement('div');
        eventInfo.className = 'event-info';
        
        let performersHTML = '';
        if (event.performers.length > 0) {
            performersHTML = '<div class="event-performers">';
            event.performers.forEach(performer => {
                performersHTML += `
                    <div class="performer-item">
                        <strong>${performer.name}</strong> - ${performer.instrument}
                        ${performer.piece ? `<br><em>${performer.piece}</em>` : ''}
                        ${performer.duration ? `<span class="duration">${performer.duration}</span>` : ''}
                    </div>
                `;
            });
            performersHTML += '</div>';
        }
        
        eventInfo.innerHTML = `
            <div class="event-title">${event.remarks}</div>
            <div class="event-guest">Guest: ${formatGuestArtist(event.guestArtist)}</div>
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
        const dateStr = `${monthNames[event.date.getMonth()]} ${event.date.getDate()}, ${event.date.getFullYear()}`;
        
        detailsHTML += `
            <div class="event-detail-card ${event.type}">
                <div class="event-detail-header">
                    <h3>${event.remarks}</h3>
                    <p class="event-detail-date">${dateStr}</p>
                    <p class="event-detail-guest"><strong>${formatGuestArtist(event.guestArtist).includes('Performance Class') ? '' : 'Guest Artist: '}</strong>${formatGuestArtist(event.guestArtist)}</p>
                </div>
        `;
        
        if (event.performers.length > 0) {
            detailsHTML += '<div class="event-detail-performers"><h4>Performers:</h4><ul>';
            event.performers.forEach(performer => {
                detailsHTML += `
                    <li>
                        <strong>${performer.name}</strong> - ${performer.instrument}
                        ${performer.piece ? `<br><span class="piece-title">${performer.piece}</span>` : ''}
                        ${performer.duration ? `<br><span class="duration">Duration: ${performer.duration}</span>` : ''}
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
document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('calendar-grid')) return;
    
    // Fetch events
    await fetchEvents();
    
    // Initial render
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
            if (view === 'calendar') {
                document.getElementById('calendar-view').style.display = 'block';
                document.getElementById('list-view').style.display = 'none';
            } else {
                document.getElementById('calendar-view').style.display = 'none';
                document.getElementById('list-view').style.display = 'block';
                renderListView();
            }
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
            if (activeView === 'calendar') {
                renderCalendar(currentMonth, currentYear);
            } else {
                renderListView();
            }
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
});
