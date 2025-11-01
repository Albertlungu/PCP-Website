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
    function showPasswordModal() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'password-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
        `;

        modal.innerHTML = `
            <h2 style="margin: 0 0 1rem 0; color: #8B1538; font-family: 'Playfair Display', serif;">Password Required</h2>
            <p style="margin: 0 0 1.5rem 0; color: #666; font-size: 0.95rem;">Please enter the password to access the performance sign-up page.</p>
            <form id="password-form">
                <input
                    type="password"
                    id="password-input"
                    placeholder="Enter password"
                    style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 1rem;
                        box-sizing: border-box;
                        margin-bottom: 1rem;
                        transition: border-color 0.3s;
                    "
                    required
                    autofocus
                >
                <div id="error-message" style="color: #d32f2f; font-size: 0.875rem; margin-bottom: 1rem; min-height: 1.25rem;"></div>
                <div style="display: flex; gap: 0.75rem;">
                    <button
                        type="button"
                        id="cancel-btn"
                        style="
                            flex: 1;
                            padding: 0.75rem 1.5rem;
                            background: #f5f5f5;
                            color: #333;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: background 0.3s;
                            font-weight: 500;
                        "
                    >Cancel</button>
                    <button
                        type="submit"
                        style="
                            flex: 1;
                            padding: 0.75rem 1.5rem;
                            background: #8B1538;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: background 0.3s;
                            font-weight: 500;
                        "
                    >Submit</button>
                </div>
            </form>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add hover effects
        const submitBtn = modal.querySelector('button[type="submit"]');
        submitBtn.addEventListener('mouseenter', () => {
            submitBtn.style.background = '#a01a42';
        });
        submitBtn.addEventListener('mouseleave', () => {
            submitBtn.style.background = '#8B1538';
        });

        const cancelBtn = modal.querySelector('#cancel-btn');
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#e0e0e0';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = '#f5f5f5';
        });

        // Focus input with border effect
        const passwordInput = modal.querySelector('#password-input');
        passwordInput.addEventListener('focus', () => {
            passwordInput.style.borderColor = '#8B1538';
        });
        passwordInput.addEventListener('blur', () => {
            passwordInput.style.borderColor = '#ddd';
        });

        // Handle form submission
        const form = modal.querySelector('#password-form');
        const errorMessage = modal.querySelector('#error-message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPassword = passwordInput.value;

            if (enteredPassword === CORRECT_PASSWORD) {
                setAuthenticated();
                overlay.remove();
                // If we're not on the signup page, redirect to it
                if (!window.location.pathname.includes('signup.html')) {
                    window.location.href = 'signup.html';
                }
            } else {
                errorMessage.textContent = 'Incorrect password. Please try again.';
                passwordInput.value = '';
                passwordInput.focus();
                passwordInput.style.borderColor = '#d32f2f';
            }
        });

        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            // Redirect to home if we're on signup page
            if (window.location.pathname.includes('signup.html')) {
                window.location.href = 'index.html';
            }
        });
    }

    /**
     * Initialize authentication check for signup page
     */
    function initSignupPageAuth() {
        if (window.location.pathname.includes('signup.html')) {
            if (!isAuthenticated()) {
                // Hide page content
                document.body.style.visibility = 'hidden';

                // Show password modal
                showPasswordModal();

                // After modal is shown, prevent back navigation
                const observer = new MutationObserver(() => {
                    if (!document.getElementById('password-modal-overlay')) {
                        if (isAuthenticated()) {
                            document.body.style.visibility = 'visible';
                            observer.disconnect();
                        }
                    }
                });
                observer.observe(document.body, { childList: true });
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
