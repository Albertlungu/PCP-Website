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
        note.style.opacity = `${0.25 + Math.random() * 0.35}`;

        notesWrapper.appendChild(note);
    }
}

const BACKGROUND_NOTE_SYMBOLS = ['♪', '♫', '♬', '♩', '♭', '♯'];

function spawnFloatingNote(x, y) {
    const note = document.createElement('div');
    note.className = 'floating-note';
    note.textContent = BACKGROUND_NOTE_SYMBOLS[Math.floor(Math.random() * BACKGROUND_NOTE_SYMBOLS.length)];
    // Add scroll offset to position correctly
    note.style.left = `${x + window.pageXOffset}px`;
    note.style.top = `${y + window.pageYOffset}px`;
    note.style.setProperty('--floating-note-delay', '0.12s');
    document.body.appendChild(note);
    setTimeout(() => {
        note.remove();
    }, 2200);
}

function spawnClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    // Add scroll offset to position correctly
    ripple.style.left = `${x + window.pageXOffset}px`;
    ripple.style.top = `${y + window.pageYOffset}px`;
    const size = 280;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    document.body.appendChild(ripple);
    setTimeout(() => {
        ripple.remove();
    }, 900);
}

function initBackgroundNoteClicks() {
    const container = document.querySelector('.background-animations');
    if (!container) return;

    const interactiveSelector = 'a, button, input, textarea, select, label, .btn, .nav-menu, [data-ignore-note]';

    document.addEventListener('click', (event) => {
        if (event.target.closest(interactiveSelector)) {
            return;
        }

        spawnClickRipple(event.clientX, event.clientY);
        spawnFloatingNote(event.clientX, event.clientY);

        const notesWrapper = container.querySelector('.background-notes');
        if (notesWrapper) {
            const note = document.createElement('span');
            note.textContent = BACKGROUND_NOTE_SYMBOLS[Math.floor(Math.random() * BACKGROUND_NOTE_SYMBOLS.length)];
            note.style.top = `${(event.clientY / window.innerHeight) * 100}%`;
            note.style.left = `${(event.clientX / window.innerWidth) * 100}%`;
            note.style.fontSize = `${2 + Math.random() * 1.5}rem`;
            note.style.setProperty('--note-duration', `${12 + Math.random() * 8}s`);
            note.style.setProperty('--note-delay', `${-Math.random() * 10}s`);
            note.style.opacity = `${0.35 + Math.random() * 0.3}`;
            notesWrapper.appendChild(note);
        }
    });
}

// Create scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        width: 0%;
        z-index: 9999;
        transition: width 0.1s ease;
        box-shadow: 0 2px 10px rgba(139, 21, 56, 0.5);
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Scroll-reactive depth effect
function initScrollDepth() {
    const sections = document.querySelectorAll('.features, .cta, .content-section');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrolled;
            const sectionHeight = rect.height;
            
            // Calculate parallax offset
            const offset = (scrolled - sectionTop + window.innerHeight) / (sectionHeight + window.innerHeight);
            
            if (offset > 0 && offset < 1) {
                const translateY = (offset - 0.5) * 50;
                section.style.transform = `translateY(${translateY}px)`;
                section.style.opacity = 0.5 + (1 - Math.abs(offset - 0.5)) * 0.5;
            }
        });
    });
}

// Magnetic button effect
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive effects
    initScrollDepth();
    initMagneticButtons();
    createBackgroundDecor();
    initBackgroundNoteClicks();
    
    // Dropdown overlay effect
    const dropdowns = document.querySelectorAll('.has-dropdown');
    let dropdownTimeout;
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(dropdownTimeout);
            document.body.classList.add('dropdown-active');
        });
        
        dropdown.addEventListener('mouseleave', function() {
            dropdownTimeout = setTimeout(() => {
                // Check if mouse is over any dropdown
                const anyDropdownHovered = Array.from(dropdowns).some(dd => dd.matches(':hover'));
                if (!anyDropdownHovered) {
                    document.body.classList.remove('dropdown-active');
                }
            }, 100);
        });
    });
    
    // Create scroll progress indicator
    createScrollProgress();
    
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
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
    
    backToTop.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(360deg)';
    });
    
    backToTop.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const allNavLinks = document.querySelectorAll('.nav-menu a');
    allNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Intersection Observer for fade-in animations with stagger effect
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe feature cards with staggered animation
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });
    
    // Student cards without animation
    document.querySelectorAll('.student-card').forEach((card) => {
        card.style.opacity = '1';
        card.style.transform = 'none';
    });
    
    // Observe content cards with scale effect (skip on code of conduct page)
    const isCodeOfConduct = window.location.pathname.includes('code-of-conduct');
    document.querySelectorAll('.content-card').forEach((card, index) => {
        if (isCodeOfConduct) {
            // No animations on code of conduct page
            card.style.opacity = '1';
            card.style.transform = 'none';
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        }
    });
    
    // Parallax effect for hero section with mouse tracking
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            if (scrolled < hero.offsetHeight) {
                hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
        });
        
        // Mouse movement effect on hero
        hero.addEventListener('mousemove', function(e) {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const moveX = (x - 0.5) * 30;
            const moveY = (y - 0.5) * 30;
            
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
            
            // Move particles container
            const particles = hero.querySelector('.particles');
            if (particles) {
                particles.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
            }
        });
        
        hero.addEventListener('mouseleave', function() {
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = 'translate(0, 0)';
            }
            const particles = hero.querySelector('.particles');
            if (particles) {
                particles.style.transform = 'translate(0, 0)';
            }
        });
    }
    
    // Add hover sound effect simulation (visual feedback)
    document.querySelectorAll('.btn, .feature-card, .student-card').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });
    });
    
    // Animate navigation links on hover
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add typing effect to hero title (only on home page)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        heroTitle.style.opacity = '1';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        setTimeout(typeWriter, 500);
    }
});
