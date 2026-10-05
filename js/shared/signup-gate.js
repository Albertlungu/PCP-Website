/**
 * Sign Up Page Authentication
 * Protects the signup page with a password
 */

(function() {
    'use strict';

    const CORRECT_PASSWORD = 'pcp2025';
    const AUTH_SESSION_KEY = 'signup_authenticated';
    const AUTH_TIMESTAMP_KEY = 'signup_auth_timestamp';
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    function isAuthenticated() {
        const authStatus = sessionStorage.getItem(AUTH_SESSION_KEY);
        const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);

        if (authStatus === 'true' && timestamp) {
            const timePassed = Date.now() - parseInt(timestamp, 10);
            if (timePassed < SESSION_DURATION) {
                return true;
            } else {
                // Session expired
                clearAuthentication();
                return false;
            }
        }
        return false;
    }

    /**
     * Set authentication status
     */
    function setAuthenticated() {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        sessionStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
    }

    /**
     * Clear authentication
     */
    function clearAuthentication() {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
    }

    /**
     * Show password modal
     */
    function isSignupPage() {
        return /\/signup(\.html)?$/.test(window.location.pathname);
    }

    // inline: render in place of the sign-up form (on signup.html) instead of as a dialog
    function showPasswordModal(inline = false) {
        if (document.getElementById('password-modal-overlay')) return;

        // Styles live in css/site.css (.gate-*)
        const overlay = document.createElement(inline ? 'section' : 'div');
        overlay.id = 'password-modal-overlay';
        overlay.className = inline ? 'gate-inline' : 'gate-overlay';

        const modal = document.createElement('div');
        modal.className = 'gate-dialog';
        if (!inline) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
        }
        modal.setAttribute('aria-labelledby', 'gate-title');
        modal.innerHTML = `
            <h2 id="gate-title">Performance sign-up</h2>
            <p>Enter the password from your program coordinator to open the sign-up form.</p>
            <form id="password-form">
                <label class="gate-label" for="password-input">Password</label>
                <input type="password" id="password-input" class="gate-input" autocomplete="current-password" required>
                <div id="error-message" class="gate-error" role="alert"></div>
                <div class="gate-actions">
                    <button type="button" id="cancel-btn" class="gate-btn gate-btn-secondary">Cancel</button>
                    <button type="submit" class="gate-btn gate-btn-primary">Open sign-up</button>
                </div>
            </form>
        `;

        if (inline) {
            const container = document.createElement('div');
            container.className = 'container';
            container.appendChild(modal);
            overlay.appendChild(container);
            document.querySelector('.page-header').after(overlay);
        } else {
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        }

        const cancelBtn = modal.querySelector('#cancel-btn');
        const passwordInput = modal.querySelector('#password-input');
        // autofocus is ignored on elements inserted after load
        setTimeout(() => passwordInput.focus(), 0);

        // Handle form submission
        const form = modal.querySelector('#password-form');
        const errorMessage = modal.querySelector('#error-message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPassword = passwordInput.value;

            if (enteredPassword === CORRECT_PASSWORD) {
                setAuthenticated();
                overlay.remove();
                document.querySelectorAll('.content-section').forEach(section => { section.hidden = false; });
                // If we're not on the signup page, redirect to it
                if (!isSignupPage()) {
                    window.location.href = sitePath('html/participate/signup.html');
                }
            } else {
                errorMessage.textContent = 'That password is incorrect. Check with your program coordinator.';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });

        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            // Redirect to home if we're on signup page
            if (isSignupPage()) {
                window.location.href = sitePath('index.html');
            }
        });
    }

    /**
     * Initialize authentication check for signup page
     */
    function initSignupPageAuth() {
        if (isSignupPage()) {
            if (!isAuthenticated()) {
                // Keep the page (nav, title, footer); hold back only the form
                document.querySelectorAll('.content-section').forEach(section => { section.hidden = true; });
                showPasswordModal(true);
            }
        }
    }

    /**
     * Intercept clicks on "Sign Up to Perform" links
     */
    function interceptSignupLinks() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href*="signup.html"]');
            if (target) {
                e.preventDefault();

                if (!isAuthenticated()) {
                    showPasswordModal();
                } else {
                    window.location.href = target.href;
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSignupPageAuth();
            interceptSignupLinks();
        });
    } else {
        initSignupPageAuth();
        interceptSignupLinks();
    }
})();
