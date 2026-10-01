// Signup functionality for PCP Website
// This handles the performance signup form and writes to Google Sheets

const SPREADSHEET_ID = '1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68';
const SHEET_NAME = 'Performances';

// This would be your Google Apps Script Web App URL
// You'll need to create a Google Apps Script that handles POST requests
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHnrO6qMQeGDAYySA4xDP22APgutMoXSb4vtviOO3GIvKnRX8PhP6lv9hPGGnULjib/exec';

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
        // No custom headers: Apps Script can't answer a CORS preflight
        const response = await fetch(`${SCRIPT_URL}?action=getAvailableDates`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Successfully loaded dates via CORS');
        if (!result.success) throw new Error(result.message || 'Could not load dates');
        return result.dates;

    } catch (corsError) {
        // Fall back to JSONP if CORS fails
        console.warn('❌ CORS failed, trying JSONP fallback:', corsError.message);

        try {
            const result = await loadJsonp(`${SCRIPT_URL}?action=getAvailableDates`);
            console.log('✅ Successfully loaded dates via JSONP fallback');
            if (!result.success) throw new Error(result.message || 'Could not load dates');
            return result.dates;
        } catch (jsonpError) {
            console.error('❌ Both CORS and JSONP failed:', jsonpError.message);
            return null;
        }
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Display available slots
async function displayAvailableSlots() {
    const slotsContainer = document.getElementById('available-slots');
    const dates = await fetchAvailableDates();
    const form = document.getElementById('performance-signup-form');
    const formControls = form.querySelectorAll('input, select, textarea, button');
    
    if (dates === null) {
        availableDates = [];
        slotsContainer.innerHTML = '<p class="no-slots unavailable"><strong>Sign-ups are temporarily unavailable.</strong> Please try again later or contact the program coordinator.</p>';
        formControls.forEach(control => { control.disabled = true; });
        form.classList.add('is-disabled');
        return;
    }
    
    availableDates = dates;
    formControls.forEach(control => { control.disabled = false; });
    form.classList.remove('is-disabled');
    
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
            availabilityText = `<div class="slot-availability">${slot.availableSlots} ${slot.availableSlots === 1 ? 'slot' : 'slots'} available</div>`;
        }

        slotCard.innerHTML = `
            <div class="slot-icon">🎵</div>
            <div class="slot-info">
                <div class="slot-date">${escapeHtml(slot.label)}</div>
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

// Submit form to Google Sheets
async function submitPerformance(formData) {
    // Sent as text/plain (no custom headers) so the browser skips the CORS preflight
    // and we can read the script's JSON reply. Never fall back to no-cors: that
    // hides failures and would tell the student they're registered when they aren't.
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
        success: !!result.success,
        message: result.message || ''
    };
}

// Accepts plain minutes ("12", "9.5") or minutes' seconds'' ("12' 30''", "12'30\"")
const DURATION_PATTERN = /^(\d+(\.\d+)?|\d+'\s*(\d{1,2}\s*(''|"|')?)?)$/;

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
    } else if (!DURATION_PATTERN.test(formData.duration.trim())) {
        errors.push('Duration must be in minutes (e.g., 12) or minutes\' seconds\'\' (e.g., 12\' 30\'\')');
    }
    
    return errors;
}

// Show form message
let formMessageTimer;
function showFormMessage(message, type = 'success') {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    clearTimeout(formMessageTimer);
    formMessageTimer = setTimeout(() => {
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
                // e.g. the slot filled up between page load and submission
                showFormMessage(`✗ ${result.message || 'Your registration could not be completed. Please try again.'}`, 'error');
            }
        } catch (error) {
            showFormMessage('✗ An error occurred while submitting your registration. Please try again or contact the program coordinator.', 'error');
            console.error('Submission error:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = availableDates.length === 0;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
    
    // Real-time validation hints
    const durationInput = document.getElementById('duration');
    
    durationInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && !DURATION_PATTERN.test(value)) {
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
    
});
