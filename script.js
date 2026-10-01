// Site navigation: mobile menu, dropdowns on small screens, and current-page highlighting

// Matches the 900px breakpoint in css/site.css where the menu collapses
const MOBILE_NAV_QUERY = window.matchMedia('(max-width: 900px)');

document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');

    function closeMenu() {
        if (!menu) return;
        menu.classList.remove('active');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
        document.querySelectorAll('.has-dropdown.active').forEach(item => item.classList.remove('active'));
    }

    if (toggle && menu) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', function() {
            const open = menu.classList.toggle('active');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    // On small screens the dropdown parents expand in place instead of opening on hover
    document.querySelectorAll('.dropdown-toggle').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            if (MOBILE_NAV_QUERY.matches) {
                link.closest('.has-dropdown').classList.toggle('active');
            }
        });
    });

    document.querySelectorAll('.nav-menu a:not(.dropdown-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            if (MOBILE_NAV_QUERY.matches) closeMenu();
        });
    });

    document.addEventListener('click', function(event) {
        if (MOBILE_NAV_QUERY.matches && menu?.classList.contains('active') && !event.target.closest('.navbar')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeMenu();
    });

    // Mark the current page; compare without ".html" so clean URLs (e.g. /calendar) still match
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const linkPage = link.getAttribute('href').replace(/\.html$/, '');
        link.classList.toggle('active', linkPage === currentPage);
        if (linkPage === currentPage) link.setAttribute('aria-current', 'page');
    });

    // Highlight the dropdown parent (e.g. "Program") when the current page is inside it
    document.querySelectorAll('.dropdown-menu a.active').forEach(link => {
        link.closest('.has-dropdown').querySelector('.dropdown-toggle').classList.add('active');
    });
});

// "today", "tomorrow", "in 3 days" for dates in the next two weeks; empty otherwise
function relativeDay(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((date - today) / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    return days > 1 && days < 14 ? `in ${days} days` : '';
}

// Cross-fades a DOM update where the browser supports view transitions and motion is welcome
function withViewTransition(update) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(update);
    } else {
        update();
    }
}
