// Simple password protection for admin area
(function() {
    'use strict';

    // Check if we're on localhost (no password needed locally)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Running on localhost - password protection disabled');
        return;
    }

    // Password configuration
    const ADMIN_PASSWORD_HASH = '9b8db5a29882eae4c14362fd7d3cbbf23f41985f3757002536fa7d851c9fbb6f'; // Default: empty string, change this!
    const SESSION_KEY = 'admin_authenticated';
    
    // Check if already authenticated in this session
    const isAuthenticated = sessionStorage.getItem(SESSION_KEY) === 'true';
    
    if (!isAuthenticated) {
        // Simple hash function (SHA-256 would be better but requires async)
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Prompt for password
        async function authenticate() {
            const password = prompt('Enter admin password to access this area:');
            
            if (password === null) {
                // User cancelled
                window.location.href = '/';
                return;
            }
            
            const hash = await hashPassword(password);
            
            if (hash === ADMIN_PASSWORD_HASH) {
                sessionStorage.setItem(SESSION_KEY, 'true');
                location.reload();
            } else {
                alert('Incorrect password. Redirecting to home page.');
                window.location.href = '/';
            }
        }
        
        authenticate();
    }
})();
