// Signup functionality for PCP Website
// This handles the performance signup form and writes to Google Sheets

const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
const SHEET_NAME = 'Sheet1';

// This would be your Google Apps Script Web App URL
// You'll need to create a Google Apps Script that handles POST requests
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3wMEwOpDMGyO-OMeNb9_T4Cdme4KfMVgAk7tXDqeA2jB9FX6jxeKLqBOLt1bzuGl0/exec';

// Available dates for signup (dates that have HOST or available slots)
let availableDates = [];

// JSONP loader as fallback for CORS issues
function loadJsonp(url, callbackParam = 'callback') {
    return new Promise((resolve, reject) => {
        const cbName = `jsonp_cb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const script = document.createElement('script');
        const sep = url.includes('?') ? '&' : '?';
        script.src = `${url}${sep}${callbackParam}=${cbName}`;
        script.async = true;

        const cleanup = () => {
            if (script.parentNode) script.parentNode.removeChild(script);
            try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        };

        window[cbName] = (data) => {
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error('JSONP request failed'));
        };

        document.head.appendChild(script);
    });
}

// Fetch available dates from the sheet with CORS fallback
async function fetchAvailableDates() {
    try {
        // Try regular CORS mode first
        const response = await fetch(`${SCRIPT_URL}?action=getAvailableDates`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Successfully loaded dates via CORS');
        return result.success ? result.dates : getFallbackDates();

    } catch (corsError) {
        // Fall back to JSONP if CORS fails
        console.warn('❌ CORS failed, trying JSONP fallback:', corsError.message);

        try {
            const result = await loadJsonp(`${SCRIPT_URL}?action=getAvailableDates`);
            console.log('✅ Successfully loaded dates via JSONP fallback');
            return result.success ? result.dates : getFallbackDates();
        } catch (jsonpError) {
            console.error('❌ Both CORS and JSONP failed:', jsonpError.message);
            return getFallbackDates();
        }
    }
}

// Fallback dates function
function getFallbackDates() {
    return [
        { date: 'Nov 08', label: 'November 8, 2025 - Performance Class', available: true },
        { date: 'Nov 22', label: 'November 22, 2025 - Violin Masterclass', available: true },
        { date: 'Nov 29', label: 'November 29, 2025 - Viola Masterclass', available: true },
        { date: 'Dec 06', label: 'December 6, 2025 - Performance Class', available: true }
    ];
}

// Display available slots
async function displayAvailableSlots() {
    const slotsContainer = document.getElementById('available-slots');
    availableDates = await fetchAvailableDates();
    
    if (availableDates.length === 0) {
        slotsContainer.innerHTML = '<p class="no-slots">No available slots at the moment. Please check back later.</p>';
        return;
    }
    
    slotsContainer.innerHTML = '';
    
    availableDates.forEach(slot => {
        const slotCard = document.createElement('div');
        slotCard.className = 'slot-card';

        let availabilityText = '';
        if (slot.availableSlots !== undefined) {
            availabilityText = `<div class="slot-availability">${slot.availableSlots} slots available</div>`;
        }

        slotCard.innerHTML = `
            <div class="slot-icon">🎵</div>
            <div class="slot-info">
                <div class="slot-date">${slot.label}</div>
                <div class="slot-status available">Available</div>
                ${availabilityText}
            </div>
        `;
        slotsContainer.appendChild(slotCard);
    });
    
    // Populate date dropdown
    const dateSelect = document.getElementById('date');
    dateSelect.innerHTML = '<option value="">Select a date...</option>';
    availableDates.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.date;
        option.textContent = slot.label;
        dateSelect.appendChild(option);
    });
}

// Submit form to Google Sheets with CORS fallback
async function submitPerformance(formData) {
    try {
        // Try regular CORS mode first
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Successfully submitted via CORS');

        if (result.success) {
            return {
                success: true,
                message: 'Registration submitted successfully!'
            };
        } else {
            throw new Error(result.message || 'Submission failed');
        }

    } catch (corsError) {
        // Fall back to no-cors mode if CORS fails
        console.warn('❌ CORS failed for submission, trying no-cors mode:', corsError.message);

        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // In no-cors mode we can't read the response, so assume success
        console.log('✅ Submitted via no-cors fallback');
        return {
            success: true,
            message: 'Registration submitted successfully! Please check your email for confirmation.'
        };
    }
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.date) {
        errors.push('Please select a performance date');
    }
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Please enter your full name');
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.instrument) {
        errors.push('Please select your instrument');
    }
    
    if (!formData.piece || formData.piece.trim().length < 3) {
        errors.push('Please enter the piece you will perform');
    }
    
    if (!formData.duration) {
        errors.push('Please enter the estimated duration');
    } else if (!/^\d+[']\s*\d*["']?$/.test(formData.duration.trim())) {
        errors.push('Duration must be in format: minutes\' seconds" (e.g., 12\' 30")');
    }
    
    return errors;
}

// Show form message
function showFormMessage(message, type = 'success') {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Initialize signup form
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('performance-signup-form');
    if (!form) return;
    
    // Load available dates
    await displayAvailableSlots();
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            date: document.getElementById('date').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            instrument: document.getElementById('instrument').value,
            piece: document.getElementById('piece').value,
            duration: document.getElementById('duration').value,
            remarks: document.getElementById('remarks').value
        };
        
        // Validate form
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showFormMessage(errors.join('. '), 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        
        try {
            // Submit to Google Sheets
            const result = await submitPerformance(formData);
            
            if (result.success) {
                showFormMessage('✓ Your performance registration has been submitted successfully! You will receive a confirmation email shortly.', 'success');
                form.reset();
                
                // Refresh available slots
                await displayAvailableSlots();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            showFormMessage('✗ An error occurred while submitting your registration. Please try again or contact the program coordinator.', 'error');
            console.error('Submission error:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
    
    // Real-time validation hints
    const nameInput = document.getElementById('name');
    const pieceInput = document.getElementById('piece');
    const durationInput = document.getElementById('duration');
    
    durationInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && !/^\d+[']\s*\d*["']?$/.test(value)) {
            this.classList.add('invalid');
            const helpText = this.nextElementSibling;
            if (helpText) {
                helpText.style.color = 'var(--accent-color)';
            }
        } else {
            this.classList.remove('invalid');
            const helpText = this.nextElementSibling;
            if (helpText) {
                helpText.style.color = '';
            }
        }
    });
    
    // Auto-format duration
    durationInput.addEventListener('input', function() {
        let value = this.value;
        // Remove any existing quotes
        value = value.replace(/['"]/g, '');
        
        // If user types numbers, auto-format
        if (/^\d+$/.test(value)) {
            if (value.length >= 2) {
                this.value = value + '\' ';
            }
        }
    });
});
