// Cursor trail effect
function initCursorTrail() {
    const trail = [];
    const trailLength = 20;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `
            position: fixed;
            width: ${8 - i * 0.3}px;
            height: ${8 - i * 0.3}px;
            background: rgba(139, 21, 56, ${0.5 - i * 0.025});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        let x = mouseX;
        let y = mouseY;
        
        trail.forEach((dot, index) => {
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            
            const nextDot = trail[index + 1] || trail[0];
            x += (parseInt(nextDot.style.left) - x) * 0.3;
            y += (parseInt(nextDot.style.top) - y) * 0.3;
        });
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// Create interactive grid overlay
function createGridOverlay() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const grid = document.createElement('div');
    grid.className = 'grid-overlay';
    grid.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        pointer-events: none;
        animation: gridPulse 4s ease-in-out infinite;
    `;
    
    hero.insertBefore(grid, hero.firstChild);
}

// Create animated particles for hero section
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        transition: transform 0.3s ease-out;
    `;
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 3 + 1;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(212, 175, 55, ${Math.random() * 0.6 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 15 + 15}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 ${size * 2}px rgba(212, 175, 55, 0.5);
        `;
        particlesContainer.appendChild(particle);
    }
    
    hero.insertBefore(particlesContainer, hero.firstChild);
}

function createBackgroundDecor() {
    const container = document.querySelector('.background-animations');
    if (!container) return;

    container.innerHTML = '';

    const waves = document.createElement('div');
    waves.className = 'background-waves';
    container.appendChild(waves);

    const notesWrapper = document.createElement('div');
    notesWrapper.className = 'background-notes';
    container.appendChild(notesWrapper);

    const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♯'];
    const noteCount = 18;

    for (let i = 0; i < noteCount; i++) {
        const note = document.createElement('span');
        const symbol = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        note.textContent = symbol;
        const size = 2.2 + Math.random() * 1.4;
        const top = Math.random() * 90;
        const left = Math.random() * 95;
        const duration = 14 + Math.random() * 10;
        const delay = -Math.random() * duration;

        note.style.top = `${top}%`;
        note.style.left = `${left}%`;
        note.style.fontSize = `${size}rem`;
        note.style.setProperty('--note-duration', `${duration}s`);
        note.style.setProperty('--note-delay', `${delay}s`);
        // Kept faint so the notes don't compete with page text
        note.style.opacity = `${0.15 + Math.random() * 0.2}`;

        notesWrapper.appendChild(note);
    }
}


// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    createBackgroundDecor();
    
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(139, 21, 56, 0.4);
    `;
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = this.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(7px, -6px)' : 'none';
        });
    }
    
    // Mobile dropdown toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Only handle on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = this.closest('.has-dropdown');
                parent.classList.toggle('active');
            }
        });
    });
    
    // Close mobile menu when clicking on a link (but not dropdown toggles)
    const navLinks = document.querySelectorAll('.nav-menu a:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                if (mobileMenuToggle) {
                    const spans = mobileMenuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
                // Close any open dropdowns
                document.querySelectorAll('.has-dropdown.active').forEach(dd => {
                    dd.classList.remove('active');
                });
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
            if (!e.target.closest('.navbar')) {
                navMenu.classList.remove('active');
                if (mobileMenuToggle) {
                    const spans = mobileMenuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
                // Close any open dropdowns
                document.querySelectorAll('.has-dropdown.active').forEach(dd => {
                    dd.classList.remove('active');
                });
            }
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll and focus behavior
    const navbar = document.querySelector('.navbar');
    function setNavbarScrolled() {
        if (!navbar) return;
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        const shift = Math.min(window.pageYOffset * 0.3, 300);
        document.documentElement.style.setProperty('--bg-shift', shift.toFixed(2));
    }
    window.addEventListener('scroll', setNavbarScrolled);
    setNavbarScrolled();

    if (navbar) {
        navbar.addEventListener('mouseenter', () => {
            document.body.classList.add('nav-focused');
        });
        navbar.addEventListener('mouseleave', () => {
            document.body.classList.remove('nav-focused');
        });
    }

    // Add active class to current page in navigation
    // Compare without ".html" so clean URLs (e.g. /calendar) still match
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    const allNavLinks = document.querySelectorAll('.nav-menu a');
    allNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href').replace(/\.html$/, '');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Highlight the dropdown parent (e.g. "Program") when the current page is inside it
    document.querySelectorAll('.dropdown-menu a.active').forEach(link => {
        link.closest('.has-dropdown').querySelector('.dropdown-toggle').classList.add('active');
    });
});
