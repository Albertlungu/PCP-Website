// Snack schedule: reads the "Snacks" tab of the Google Sheet (see js/shared/config.js) and fills the
// "Snacks" panel on the home page and the season table on the snacks page.

(function() {
    'use strict';

    const { cell, escapeHtml, formatDate } = Sheets;
    const SNACKS_PAGE = sitePath('html/participate/snacks.html');

    /**
     * Parse the "Snacks" tab.
     * Layout: a title row, a header row (Week, Date, Parent Name, Student Name), then one row per Saturday.
     * A non-numeric Week (e.g. "Thanksgiving") marks a Saturday without classes; rows without a date
     * (e.g. "Winter Break") are skipped.
     */
    function parseSnacks(rows) {
        const weeks = [];
        rows.forEach(row => {
            const date = Sheets.parseDate(cell(row, 1));
            if (!date) return;
            const week = cell(row, 0);
            const isSession = /^\d+$/.test(week);
            weeks.push({
                date,
                note: isSession ? '' : week,
                parent: isSession ? cell(row, 2) : '',
                student: isSession ? cell(row, 3) : ''
            });
        });
        return weeks.sort((a, b) => a.date - b.date);
    }

    /** "Sofia Torunski's family", or nothing when the sheet has no student (e.g. "Open to all") */
    function familyOf(week) {
        if (!week.student || week.student.toLowerCase() === 'all') return '';
        return `${week.student}’s family`;
    }

    /** "Thanksgiving (no classes)", or the label alone when it already says so ("No Classes") */
    function noClassesLabel(note) {
        return /no class/i.test(note) ? note : `${note} (no classes)`;
    }

    /** Home page: who brings snacks on the next Saturday (today, if it is one) */
    function renderWeekSnacks(container, weeks) {
        let html = '<h2 class="week-snacks-heading">Snacks</h2>';
        const next = weeks && weeks.find(week => week.date >= siteToday());
        if (!next) {
            html += `<p class="week-snacks-note">${weeks ? 'No snack dates are scheduled.' : 'The snack schedule could not be loaded right now.'}</p>`;
        } else {
            const isToday = next.date.getTime() === siteToday().getTime();
            const relative = relativeDay(next.date);
            html += `<p class="week-snacks-date">${isToday ? 'Today, ' : ''}${escapeHtml(formatDate(next.date))}` +
                `${relative && !isToday ? ` <span class="relative-day">${relative}</span>` : ''}</p>`;
            if (next.note) {
                html += `<p class="week-snacks-note">${escapeHtml(noClassesLabel(next.note))}</p>`;
            } else {
                html += `<p class="week-snacks-name">${escapeHtml(next.parent || 'To be announced')}</p>`;
                if (familyOf(next)) html += `<p class="week-snacks-family">${escapeHtml(familyOf(next))}</p>`;
            }
        }
        container.innerHTML = html + `<p class="week-snacks-more"><a href="${SNACKS_PAGE}">All weeks</a></p>`;
    }

    /** Snacks page: every Saturday this year, past ones dimmed and the next one marked */
    function renderSnackTable(container, weeks) {
        if (!weeks) {
            container.innerHTML = '<p class="no-events">The snack schedule could not be loaded right now. Please try again later.</p>';
            return;
        }
        if (!weeks.length) {
            container.innerHTML = '<p class="no-events">No snack dates have been scheduled yet.</p>';
            return;
        }

        const today = siteToday();
        const next = weeks.find(week => week.date >= today);
        let html = '<table class="season-table"><thead><tr><th scope="col">Date</th>' +
            '<th scope="col">Parent</th><th scope="col">Student</th></tr></thead><tbody>';
        weeks.forEach(week => {
            const classes = [];
            if (week.date < today) classes.push('past');
            if (week === next) classes.push('is-next');
            const relative = week === next ? relativeDay(week.date) : '';
            html += `<tr${classes.length ? ` class="${classes.join(' ')}"` : ''}>` +
                `<td>${escapeHtml(formatDate(week.date))}${week === next ? ` <span class="next-label">${relative || 'next'}</span>` : ''}</td>` +
                (week.note
                    ? `<td colspan="2">${escapeHtml(noClassesLabel(week.note))}</td>`
                    : `<td>${escapeHtml(week.parent)}</td><td>${escapeHtml(familyOf(week) ? week.student : '')}</td>`) +
                '</tr>';
        });
        container.innerHTML = html + '</tbody></table>';
    }

    async function init() {
        const panel = document.getElementById('week-snacks');
        const table = document.getElementById('snack-schedule');
        if (!panel && !table) return;

        let weeks = null; // null means the sheet could not be read
        try {
            weeks = parseSnacks(await Sheets.fetchTab(SITE.tabs.snacks));
        } catch (error) {
            console.error('[Snacks] Error fetching from Google Sheets:', error);
        }
        if (panel) renderWeekSnacks(panel, weeks);
        if (table) renderSnackTable(table, weeks);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
