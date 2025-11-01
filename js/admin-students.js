/**
 * Admin Students Management System
 *
 * @fileoverview Comprehensive student management system for the admin panel.
 * Provides CRUD operations, undo/redo functionality, auto-save to server,
 * and localStorage persistence.
 *
 * @author UOttawa Pre-College Program
 * @version 2.0.0
 *
 * Features:
 * - Add, edit, and delete student profiles
 * - Image upload (base64 encoding) or URL input
 * - Undo/Redo with history tracking (max 50 items)
 * - Auto-save to local server with Git integration
 * - Export students to HTML format
 * - localStorage persistence for offline editing
 * - Real-time validation and preview
 *
 * Dependencies:
 * - None (vanilla JavaScript)
 *
 * Related Files:
 * - /css/admin.css - Styling for admin interface
 * - /server/admin-server.js - Backend for saving changes
 * - /admin.html - Main admin interface
 */

console.log('Admin Students JS loaded');

// ============================================================================
// CONSTANTS
// ============================================================================

/** @const {string} LocalStorage key for student data */
const STUDENTS_STORAGE_KEY = 'pcp_students_data';

/** @const {string} LocalStorage key for history/undo data */
const HISTORY_STORAGE_KEY = 'pcp_students_history';

/** @const {number} Maximum number of history items to keep */
const MAX_HISTORY_ITEMS = 50;

// ============================================================================
// GLOBAL STATE
// ============================================================================

/**
 * Array of student objects
 * @type {Array<{name: string, bio: string, image: string}>}
 */
let students = [];

/**
 * Index of currently editing student (-1 if adding new)
 * @type {number}
 */
let currentEditingIndex = -1;

/**
 * Stack of previous states for undo/redo
 * @type {Array<Array>}
 */
let historyStack = [];

/**
 * Current position in history stack
 * @type {number}
 */
let historyPosition = -1;

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');

    try {
        loadStudents();
        renderStudents();
        initializeEventListeners();
        updateUndoRedoButtons();
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Load students from localStorage
function loadStudents() {
    const savedData = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (savedData) {
        try {
            students = JSON.parse(savedData);
            console.log('Loaded students:', students);
        } catch (e) {
            console.error('Error loading students:', e);
            students = [];
        }
    } else {
        console.log('No saved students found');
    }

    // Load history
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
        try {
            historyStack = JSON.parse(savedHistory);
            historyPosition = historyStack.length - 1;
        } catch (e) {
            console.error('Error loading history:', e);
            historyStack = [];
            historyPosition = -1;
        }
    }
}

// Save students to localStorage
function saveStudents() {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    addToHistory();
    showSaveNotification();
}

// Show save notification
function showSaveNotification() {
    // Remove any existing notification
    const existingNotification = document.querySelector('.save-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✓</span>
            <span class="notification-text">Changes saved! <a href="our-students.html" target="_blank">View Preview</a></span>
        </div>
    `;

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add current state to history
function addToHistory() {
    // Remove any future history if we're not at the end
    if (historyPosition < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyPosition + 1);
    }

    // Add new state
    historyStack.push({
        timestamp: new Date().toISOString(),
        students: JSON.parse(JSON.stringify(students))
    });

    // Limit history size
    if (historyStack.length > MAX_HISTORY_ITEMS) {
        historyStack.shift();
    } else {
        historyPosition++;
    }

    // Save history
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyStack));
    updateUndoRedoButtons();
}

// Undo last action
function undo() {
    if (historyPosition > 0) {
        historyPosition--;
        students = JSON.parse(JSON.stringify(historyStack[historyPosition].students));
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
        renderStudents();
        updateUndoRedoButtons();
    }
}

// Redo last undone action
function redo() {
    if (historyPosition < historyStack.length - 1) {
        historyPosition++;
        students = JSON.parse(JSON.stringify(historyStack[historyPosition].students));
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
        renderStudents();
        updateUndoRedoButtons();
    }
}

// Update undo/redo button states
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (undoBtn) {
        undoBtn.disabled = historyPosition <= 0;
    }

    if (redoBtn) {
        redoBtn.disabled = historyPosition >= historyStack.length - 1;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');

    // Add student button
    const addStudentBtn = document.getElementById('addStudentBtn');
    console.log('Add student button:', addStudentBtn);

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', (e) => {
            console.log('Add student button clicked');
            e.preventDefault();
            e.stopPropagation();
            openModal();
        });
        console.log('Event listener attached to Add Student button');
    } else {
        console.error('Add Student button not found!');
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to delete ALL students? This action cannot be undone!')) {
                students = [];
                saveToLocalStorage();
                renderStudents();
                updateHistoryButtons();
                showNotification('All students deleted', 'warning');
            }
        });
        console.log('Clear all button listener attached');
    }

    // Modal close buttons
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
        console.log('Modal close button listener attached');
    } else {
        console.warn('Modal close button not found');
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
        console.log('Cancel button listener attached');
    } else {
        console.warn('Cancel button not found');
    }

    // Close modal when clicking outside
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeModal();
            }
        });
        console.log('Modal overlay click listener attached');
    } else {
        console.error('Edit modal not found!');
    }

    // Form submission
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleFormSubmit);
        console.log('Form submit listener attached');
    } else {
        console.warn('Student form not found');
    }

    // Image URL preview
    const imageUrl = document.getElementById('imageUrl');
    if (imageUrl) {
        imageUrl.addEventListener('input', updateImagePreview);
        console.log('Image URL input listener attached');
    } else {
        console.warn('Image URL input not found');
    }

    // File upload button
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const imageFileInput = document.getElementById('imageFileInput');

    if (uploadFileBtn && imageFileInput) {
        uploadFileBtn.addEventListener('click', () => {
            imageFileInput.click();
        });

        imageFileInput.addEventListener('change', handleImageFileUpload);
        console.log('File upload listeners attached');
    } else {
        console.warn('File upload elements not found');
    }

    // Clipboard paste support for images
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.addEventListener('paste', handleImagePaste);
        imagePreview.setAttribute('contenteditable', 'true');
        imagePreview.style.cursor = 'text';
        console.log('Clipboard paste listener attached to image preview');
    }

    // Also listen for paste on the whole modal body (studentForm already declared above)
    if (studentForm) {
        studentForm.addEventListener('paste', handleImagePaste);
        console.log('Clipboard paste listener attached to form');
    }

    // Undo/Redo buttons
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', undo);
        console.log('Undo button listener attached');
    }

    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', redo);
        console.log('Redo button listener attached');
    }

    // History button
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', showHistoryModal);
        console.log('History button listener attached');
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', showExportModal);
        console.log('Export button listener attached');
    }

    // History modal close
    const historyModalClose = document.getElementById('historyModalClose');
    if (historyModalClose) {
        historyModalClose.addEventListener('click', closeHistoryModal);
    }

    // Export modal close
    const exportModalClose = document.getElementById('exportModalClose');
    if (exportModalClose) {
        exportModalClose.addEventListener('click', closeExportModal);
    }

    // Copy code button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyExportCode);
    }

    console.log('All event listeners initialized');
}

/**
 * Scale image to 100px height while maintaining aspect ratio
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {Function} callback - Callback with scaled image data URL
 */
function scaleImageTo100px(imageDataUrl, callback) {
    const img = new Image();
    img.onload = function() {
        // Calculate new dimensions (100px height, maintain aspect ratio)
        const targetHeight = 100;
        const aspectRatio = img.width / img.height;
        const targetWidth = Math.round(targetHeight * aspectRatio);

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert back to base64
        const scaledImage = canvas.toDataURL('image/jpeg', 0.9);
        callback(scaledImage);
    };
    img.onerror = function() {
        console.error('Error loading image for scaling');
        callback(imageDataUrl); // Return original if scaling fails
    };
    img.src = imageDataUrl;
}

/**
 * Process and upload image file with scaling
 * @param {File} file - Image file to process
 */
function processImageFile(file) {
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
    }

    // Check file size (max 10MB before scaling)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('Image is too large. Please select an image smaller than 10MB.');
        return;
    }

    // Read the file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        console.log('Image loaded, original size:', base64Image.length, 'characters');

        // Scale image to 100px height
        scaleImageTo100px(base64Image, function(scaledImage) {
            console.log('Image scaled, new size:', scaledImage.length, 'characters');

            // Update the hidden image URL field with scaled base64 data
            const imageUrlInput = document.getElementById('imageUrl');
            if (imageUrlInput) {
                imageUrlInput.value = scaledImage;
            }

            // Update preview
            updateImagePreview();

            console.log('Image uploaded and scaled successfully');
        });
    };

    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        alert('Error reading the image file. Please try again.');
    };

    reader.readAsDataURL(file);
}

// Handle file upload
function handleImageFileUpload(event) {
    const file = event.target.files[0];
    processImageFile(file);
}

/**
 * Handle clipboard paste for images
 * @param {ClipboardEvent} event - Paste event
 */
function handleImagePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;

    // Look for image in clipboard
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            event.preventDefault(); // Prevent default paste behavior

            const file = items[i].getAsFile();
            console.log('Image pasted from clipboard:', file.type, file.size);

            processImageFile(file);
            return;
        }
    }
}

/**
 * Update image preview display
 */
function updateImagePreview() {
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('imagePreview');

    if (!imageUrlInput || !imagePreview) return;

    const imageUrl = imageUrlInput.value;

    if (imageUrl && imageUrl.trim() !== '') {
        // Display image (already scaled to 100px height)
        imagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview" style="height: 100px; width: auto; object-fit: contain;" onerror="this.parentElement.innerHTML='<span class=\\'preview-placeholder\\'>Invalid image</span>'">`;
        imagePreview.classList.add('has-image');
    } else {
        imagePreview.innerHTML = '<span class="preview-placeholder">📋 Paste image here or click "Choose File"</span>';
        imagePreview.classList.remove('has-image');
    }
}

// Open modal for adding/editing student
function openModal(index = -1) {
    console.log('openModal called with index:', index);

    try {
        const modal = document.getElementById('editModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('studentForm');

        console.log('Modal element:', modal);
        console.log('Modal title element:', modalTitle);
        console.log('Form element:', form);

        if (!modal) {
            console.error('Modal element not found!');
            alert('Error: Modal element not found. Please check the page structure.');
            return;
        }

        currentEditingIndex = index;

        if (index >= 0 && index < students.length) {
            // Edit mode
            console.log('Opening in edit mode');
            modalTitle.textContent = 'Edit Student';
            const student = students[index];
            document.getElementById('imageUrl').value = student.image || '';
            document.getElementById('studentName').value = student.name || '';
            document.getElementById('studentBio').value = student.bio || '';
            updateImagePreview();
        } else {
            // Add mode
            console.log('Opening in add mode');
            if (modalTitle) modalTitle.textContent = 'Add Student';
            if (form) form.reset();
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) {
                imagePreview.innerHTML = '<span class="preview-placeholder">Paste image URL below</span>';
            }
        }

        console.log('Adding active class to modal');
        modal.classList.add('active');

        // Force reflow and log classes
        setTimeout(() => {
            console.log('Modal classes after adding active:', modal.classList.toString());
            const computedStyle = window.getComputedStyle(modal);
            console.log('Modal display style:', computedStyle.display);
            console.log('Modal opacity:', computedStyle.opacity);
            console.log('Modal visibility:', computedStyle.visibility);
            console.log('Modal z-index:', computedStyle.zIndex);
            console.log('Modal position:', computedStyle.position);
            console.log('Modal pointer-events:', computedStyle.pointerEvents);

            // Check if modal is actually in viewport
            const rect = modal.getBoundingClientRect();
            console.log('Modal bounding rect:', {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            });

            // Log all parent z-indexes
            let parent = modal.parentElement;
            let level = 0;
            while (parent && level < 5) {
                const parentStyle = window.getComputedStyle(parent);
                console.log(`Parent ${level} (${parent.tagName}):`, {
                    zIndex: parentStyle.zIndex,
                    position: parentStyle.position,
                    transform: parentStyle.transform
                });
                parent = parent.parentElement;
                level++;
            }
        }, 100);

    } catch (error) {
        console.error('Error in openModal:', error);
        alert('Error opening modal: ' + error.message);
    }
}

// Close modal
function closeModal() {
    console.log('closeModal called');
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('Modal closed');
    }
    currentEditingIndex = -1;
}

// Handle form submission
function handleFormSubmit(e) {
    console.log('Form submitted');
    e.preventDefault();

    const imageUrl = document.getElementById('imageUrl').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const bio = document.getElementById('studentBio').value.trim();

    console.log('Form data:', { imageUrl: imageUrl.substring(0, 50) + '...', name, bio });

    if (!imageUrl) {
        alert('Please upload an image or provide an image URL');
        return;
    }

    if (!name || !bio) {
        alert('Please fill in all fields (name and bio are required)');
        return;
    }

    const studentData = {
        image: imageUrl,
        name: name,
        bio: bio
    };

    if (currentEditingIndex >= 0) {
        // Update existing student
        console.log('Updating student at index:', currentEditingIndex);
        students[currentEditingIndex] = studentData;
    } else {
        // Add new student
        console.log('Adding new student');
        students.push(studentData);
    }

    saveStudents();
    renderStudents();
    closeModal();
}

// Render students grid
function renderStudents() {
    console.log('Rendering students...');
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) {
        console.error('Students grid not found!');
        return;
    }

    studentsGrid.innerHTML = '';

    students.forEach((student, index) => {
        const studentCard = createStudentCard(student, index);
        studentsGrid.appendChild(studentCard);
    });

    console.log('Rendered', students.length, 'students');
}

// Create a student card element
function createStudentCard(student, index) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
        <div class="student-image">
            <img src="${escapeHtml(student.image)}" alt="${escapeHtml(student.name)}">
        </div>
        <div class="student-info">
            <h3>${escapeHtml(student.name)}</h3>
            <p>${escapeHtml(student.bio)}</p>
        </div>
        <div class="student-actions">
            <button class="action-btn edit-btn" data-index="${index}">
                <span>✏️</span> Edit
            </button>
            <button class="action-btn delete-btn" data-index="${index}">
                <span>🗑️</span> Delete
            </button>
        </div>
    `;

    // Add event listeners
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
        console.log('Edit button clicked for index:', index);
        openModal(index);
    });

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteStudent(index));

    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Delete student
function deleteStudent(index) {
    if (confirm(`Are you sure you want to delete ${students[index].name}?`)) {
        console.log('Deleting student at index:', index);
        students.splice(index, 1);
        saveStudents();
        renderStudents();
    }
}

// Show history modal
function showHistoryModal() {
    console.log('Opening history modal');
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');

    if (!historyModal || !historyList) {
        console.error('History modal elements not found');
        return;
    }

    historyList.innerHTML = '';

    if (historyStack.length === 0) {
        historyList.innerHTML = '<p class="no-history">No history available</p>';
    } else {
        historyStack.slice().reverse().forEach((entry, reverseIndex) => {
            const index = historyStack.length - 1 - reverseIndex;
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item' + (index === historyPosition ? ' active' : '');

            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleString();

            historyItem.innerHTML = `
                <div class="history-info">
                    <strong>${formattedDate}</strong>
                    <span>${entry.students.length} student(s)</span>
                </div>
                <button class="restore-btn" data-index="${index}">Restore</button>
            `;

            const restoreBtn = historyItem.querySelector('.restore-btn');
            restoreBtn.addEventListener('click', () => restoreFromHistory(index));

            historyList.appendChild(historyItem);
        });
    }

    historyModal.classList.add('active');
}

// Close history modal
function closeHistoryModal() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.remove('active');
    }
}

// Restore from history
function restoreFromHistory(index) {
    if (confirm('Restore this version? Current changes will be saved to history.')) {
        historyPosition = index;
        students = JSON.parse(JSON.stringify(historyStack[index].students));
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
        renderStudents();
        updateUndoRedoButtons();
        closeHistoryModal();
    }
}

// Auto-save to server
async function autoSaveToServer() {
    console.log('🔵 [AUTO-SAVE] Starting auto-save process...');
    console.log('🔵 [AUTO-SAVE] Current hostname:', window.location.hostname);

    // Determine the API endpoint based on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiEndpoint = isLocalhost
        ? 'http://localhost:3000/api/save-students'
        : '/api/save-students'; // Vercel serverless function

    console.log('🔵 [AUTO-SAVE] Using endpoint:', apiEndpoint);
    console.log('🔵 [AUTO-SAVE] Number of students to save:', students.length);
    console.log('🔵 [AUTO-SAVE] Students data preview:', students.map(s => ({ name: s.name, imageLength: s.image?.length })));

    try {
        console.log('🔵 [AUTO-SAVE] Sending POST request...');

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                students: students,
                autoCommit: true // Enable auto-commit and push to Git
            })
        });

        console.log('🔵 [AUTO-SAVE] Response status:', response.status);
        console.log('🔵 [AUTO-SAVE] Response ok:', response.ok);

        if (!response.ok) {
            console.error('❌ [AUTO-SAVE] Response not OK, status:', response.status);
            const errorText = await response.text();
            console.error('❌ [AUTO-SAVE] Error response:', errorText);
            return false;
        }

        const result = await response.json();
        console.log('🔵 [AUTO-SAVE] Full response:', result);

        if (result.success) {
            console.log('✅ [AUTO-SAVE] Auto-save successful!');
            console.log('✅ [AUTO-SAVE] Committed to Git:', result.committed);
            if (result.commitSha) {
                console.log('✅ [AUTO-SAVE] Commit SHA:', result.commitSha);
            }
            if (result.deployInfo) {
                console.log('📡 [AUTO-SAVE]', result.deployInfo);
            }
            showAutoSaveSuccess(result.committed);
            return true;
        } else {
            console.error('❌ [AUTO-SAVE] Save failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ [AUTO-SAVE] Exception occurred:', error);
        console.error('❌ [AUTO-SAVE] Error name:', error.name);
        console.error('❌ [AUTO-SAVE] Error message:', error.message);
        console.error('❌ [AUTO-SAVE] Error stack:', error.stack);
        return false;
    }
}

// Show auto-save success notification
function showAutoSaveSuccess(committed) {
    const notification = document.createElement('div');
    notification.className = 'auto-save-notification';

    let message = '';
    if (committed) {
        message = `
            <span class="notification-icon">✓</span>
            <span class="notification-text">
                <strong>Success! Changes deployed</strong><br>
                <small>Live on Vercel in ~2 minutes</small>
            </span>
        `;
    } else {
        message = `
            <span class="notification-icon">✓</span>
            <span class="notification-text">
                <strong>Success! Website updated</strong><br>
                <small>Changes saved locally</small>
            </span>
        `;
    }

    notification.innerHTML = `<div class="notification-content">${message}</div>`;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Show export modal
async function showExportModal() {
    console.log('🟢 [EXPORT] Starting export process...');

    // Try auto-save first
    console.log('🟢 [EXPORT] Calling autoSaveToServer()...');
    const autoSaved = await autoSaveToServer();
    console.log('🟢 [EXPORT] autoSaveToServer() returned:', autoSaved);

    if (autoSaved) {
        // Auto-save successful, show success message instead of modal
        console.log('✅ [EXPORT] Auto-save successful! Modal will NOT be shown.');
        return;
    }

    console.log('⚠️ [EXPORT] Auto-save failed or not available. Showing manual export modal...');

    // Auto-save not available, show manual export modal
    const exportModal = document.getElementById('exportModal');
    const exportCode = document.getElementById('exportCode');

    if (!exportModal || !exportCode) {
        console.error('❌ [EXPORT] Export modal elements not found!');
        return;
    }

    console.log('🟢 [EXPORT] Generating HTML code...');
    // Generate HTML code
    const htmlCode = generateStudentsHTML();
    exportCode.textContent = htmlCode;

    console.log('🟢 [EXPORT] Opening export modal...');
    exportModal.classList.add('active');
}

// Close export modal
function closeExportModal() {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.classList.remove('active');
    }
}

// Generate HTML code for students
function generateStudentsHTML() {
    let html = '<div class="students-grid">\n';

    students.forEach(student => {
        html += `    <div class="student-card">\n`;
        html += `        <div class="student-image">\n`;
        html += `            <img src="${escapeHtml(student.image)}" alt="${escapeHtml(student.name)}">\n`;
        html += `        </div>\n`;
        html += `        <div class="student-info">\n`;
        html += `            <h3>${escapeHtml(student.name)}</h3>\n`;
        html += `            <p>${escapeHtml(student.bio)}</p>\n`;
        html += `        </div>\n`;
        html += `    </div>\n`;
    });

    html += '</div>';

    return html;
}

// Copy export code to clipboard
function copyExportCode() {
    const exportCode = document.getElementById('exportCode');
    const copyBtn = document.getElementById('copyCodeBtn');

    if (!exportCode || !copyBtn) return;

    navigator.clipboard.writeText(exportCode.textContent).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('success');

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('success');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
    });
}

console.log('Admin Students JS fully loaded');
