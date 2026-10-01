// Admin authentication and content management system

// Admin configuration
const ADMIN_PASSWORD = "Michael Van der Sloot";
const STORAGE_KEY = 'piano_camp_content';
const CHANGE_HISTORY_KEY = 'piano_camp_change_history';
const MAX_HISTORY_ITEMS = 50;

// Global admin state
let isAdminMode = false;
let currentEditModal = null;

// Initialize admin system
function initAdminSystem() {
    // Add admin toggle to the page
    addAdminToggle();
    
    // Initialize student card editing if on students page
    if (window.location.pathname.includes('our-students.html') || 
        window.location.pathname.endsWith('/')) {
        initStudentCardEditing();
    }
}

// Show admin login prompt
function showAdminLogin() {
    if (isAdminMode) {
        // Toggle admin mode off
        isAdminMode = false;
        disableAdminMode();
        updateAdminToggle();
    } else {
        const password = prompt('Enter admin password:');
        if (password === ADMIN_PASSWORD) {
            isAdminMode = true;
            enableAdminMode();
            updateAdminToggle();
        } else if (password !== null) {
            alert('Incorrect password');
        }
    }
}

// Enable admin mode
function enableAdminMode() {
    // Add admin controls to the page
    addAdminControls();
    
    // Make content editable
    document.body.classList.add('admin-mode');
    
    // Initialize content management
    initContentManagement();
}

// Add admin toggle to the page footer
function addAdminToggle() {
    // Check if toggle already exists
    if (document.getElementById('admin-toggle')) return;
    
    // Find the footer or create one if it doesn't exist
    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    // Add admin toggle button
    const toggle = document.createElement('div');
    toggle.id = 'admin-toggle';
    toggle.innerHTML = `
        <div class="admin-toggle-container">
            <button id="toggle-admin-btn">🔒 Admin Mode</button>
            <div id="admin-toolbar" style="display: none;">
                <button id="save-changes">💾 Save</button>
                <button id="undo-change">↩️ Undo</button>
                <span id="save-status"></span>
            </div>
        </div>
    `;
    
    footer.appendChild(toggle);
    
    // Add event listeners
    document.getElementById('toggle-admin-btn').addEventListener('click', showAdminLogin);
    document.getElementById('save-changes')?.addEventListener('click', saveAllChanges);
    document.getElementById('undo-change')?.addEventListener('click', undoLastChange);
    
    // Update the toggle state
    updateAdminToggle();
}

// Update admin toggle UI based on current state
function updateAdminToggle() {
    const toggleBtn = document.getElementById('toggle-admin-btn');
    const toolbar = document.getElementById('admin-toolbar');
    
    if (toggleBtn) {
        if (isAdminMode) {
            toggleBtn.innerHTML = '👑 Admin Mode: ON';
            toggleBtn.classList.add('active');
            if (toolbar) toolbar.style.display = 'flex';
            document.body.classList.add('admin-mode');
        } else {
            toggleBtn.innerHTML = '🔒 Admin Mode';
            toggleBtn.classList.remove('active');
            if (toolbar) toolbar.style.display = 'none';
            document.body.classList.remove('admin-mode');
            
            // Close any open modals when exiting admin mode
            if (currentEditModal) {
                currentEditModal.remove();
                currentEditModal = null;
            }
        }
    }
}

// Disable admin mode
function disableAdminMode() {
    // Update the UI
    updateAdminToggle();
    
    // Remove edit handlers
    document.querySelectorAll('[data-editable]').forEach(element => {
        element.contentEditable = false;
        element.removeEventListener('input', handleContentEdit);
    });
    
    // Remove image click handlers
    document.querySelectorAll('img[data-editable]').forEach(img => {
        img.removeEventListener('click', handleImageClick);
    });
}

// Initialize content management
function initContentManagement() {
    // Load saved content if it exists
    loadSavedContent();
    
    // Make all editable elements contenteditable
    document.querySelectorAll('[data-editable]').forEach(element => {
        element.contentEditable = true;
        element.addEventListener('input', handleContentEdit);
    });
    
    // Make all images replaceable
    document.querySelectorAll('img[data-editable]').forEach(img => {
        img.addEventListener('click', handleImageClick);
    });
}

// Handle content edit
function handleContentEdit(event) {
    const element = event.target;
    // Add visual feedback for edited elements
    element.classList.add('edited');
    
    // Update save status
    updateSaveStatus('Unsaved changes', 'unsaved');
}

// Handle image click for replacement
function handleImageClick(event) {
    const img = event.target;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                img.src = event.target.result;
                img.classList.add('edited');
                updateSaveStatus('Unsaved changes', 'unsaved');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Show add student modal
function showAddStudentModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Student</h2>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="student-name" placeholder="Enter student name">
            </div>
            <div class="form-group">
                <label>Student Description</label>
                <textarea id="student-description" placeholder="Enter student description"></textarea>
            </div>
            <div class="form-group">
                <label>Profile Image</label>
                <div class="image-upload-container">
                    <img id="student-image-preview" src="https://via.placeholder.com/300x200?text=Click+to+Upload" alt="Student Preview">
                    <input type="file" id="student-image-upload" accept="image/*" style="display: none;">
                    <button id="upload-image-btn" class="btn-upload">Upload Image</button>
                </div>
            </div>
            <div class="modal-buttons">
                <button id="cancel-add-student" class="btn-cancel">Cancel</button>
                <button id="save-student" class="btn-save">Add Student</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle image upload
    const imageUpload = modal.querySelector('#student-image-upload');
    const imagePreview = modal.querySelector('#student-image-preview');
    const uploadBtn = modal.querySelector('#upload-image-btn');
    
    uploadBtn.addEventListener('click', () => imageUpload.click());
    
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle save
    modal.querySelector('#save-student').addEventListener('click', () => {
        const name = modal.querySelector('#student-name').value || 'New Student';
        const description = modal.querySelector('#student-description').value || 'Student description goes here';
        const imageSrc = imagePreview.src;
        
        addNewStudentCard(name, description, imageSrc);
        modal.remove();
    });
    
    // Handle cancel
    modal.querySelector('#cancel-add-student').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add new student card with provided data
function addNewStudentCard(name, description, imageSrc) {
    const studentSection = document.querySelector('.students-grid') || document.querySelector('main');
    const newCard = document.createElement('div');
    newCard.className = 'student-card';
    newCard.dataset.editable = 'true';
    newCard.innerHTML = `
        <div class="student-image" data-editable="true">
            <img src="${imageSrc}" alt="${name}" data-editable="true">
            <div class="edit-overlay">Click to change image</div>
        </div>
        <div class="student-info" data-editable="true">
            <h3 contenteditable="true">${name}</h3>
            <p contenteditable="true">${description}</p>
        </div>
        <button class="remove-card" title="Remove student">×</button>
    `;
    
    // Add event listeners
    newCard.querySelector('img').addEventListener('click', handleImageClick);
    newCard.querySelector('.remove-card').addEventListener('click', (e) => {
        if (confirm('Are you sure you want to remove this student?')) {
            newCard.remove();
            updateSaveStatus('Unsaved changes', 'unsaved');
        }
    });
    
    // Add the new card at the beginning
    studentSection.insertBefore(newCard, studentSection.firstChild);
    updateSaveStatus('Unsaved changes', 'unsaved');
}

// Save all changes to local storage
function saveAllChanges() {
    const editableElements = document.querySelectorAll('[data-editable]');
    const contentData = {};
    
    // Collect all editable content
    editableElements.forEach((element, index) => {
        const elementId = element.id || `element-${index}`;
        contentData[elementId] = {
            html: element.innerHTML,
            tagName: element.tagName,
            className: element.className
        };
        
        // Remove edited class
        element.classList.remove('edited');
    });
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contentData));
    
    // Add to history
    addToHistory(contentData);
    
    updateSaveStatus('Changes saved!', 'saved');
}

// Load saved content from local storage
function loadSavedContent() {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (!savedContent) return;
    
    const contentData = JSON.parse(savedContent);
    
    Object.entries(contentData).forEach(([id, data]) => {
        const element = document.getElementById(id) || 
                       document.querySelector(`.${data.className}`) ||
                       document.querySelector(data.tagName);
        
        if (element) {
            element.innerHTML = data.html;
        }
    });
}

// Add current state to history
function addToHistory(contentData) {
    let history = JSON.parse(localStorage.getItem(CHANGE_HISTORY_KEY) || '[]');
    
    // Add new state to history
    history.unshift({
        timestamp: new Date().toISOString(),
        data: contentData
    });
    
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(CHANGE_HISTORY_KEY, JSON.stringify(history));
}

// Undo last change
function undoLastChange() {
    const history = JSON.parse(localStorage.getItem(CHANGE_HISTORY_KEY) || '[]');
    if (history.length < 2) {
        alert('No previous state to restore');
        return;
    }
    
    // Remove current state
    history.shift();
    // Get previous state
    const previousState = history[0].data;
    
    // Apply previous state
    Object.entries(previousState).forEach(([id, data]) => {
        const element = document.getElementById(id) || 
                       document.querySelector(`.${data.className}`) ||
                       document.querySelector(data.tagName);
        
        if (element) {
            element.innerHTML = data.html;
        }
    });
    
    // Update history
    localStorage.setItem(CHANGE_HISTORY_KEY, JSON.stringify(history));
    updateSaveStatus('Changes undone', 'info');
}

// Update save status in the UI
function updateSaveStatus(message, status) {
    const statusElement = document.getElementById('save-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-${status}`;
        
        // Clear status after 3 seconds
        if (status !== 'unsaved') {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = '';
            }, 3000);
        }
    }
}

// Initialize student card editing
function initStudentCardEditing() {
    // Make student cards editable on double-click
    document.addEventListener('dblclick', (e) => {
        if (!isAdminMode) return;
        
        const card = e.target.closest('.student-card');
        if (card) {
            e.preventDefault();
            e.stopPropagation();
            showEditStudentModal(card);
        }
    });
}

// Show edit student modal
function showEditStudentModal(card) {
    // Close any existing modal
    if (currentEditModal) {
        currentEditModal.remove();
    }
    
    // Get current values
    const name = card.querySelector('h3')?.textContent || '';
    const description = card.querySelector('p')?.textContent || '';
    const imageSrc = card.querySelector('img')?.src || 'https://via.placeholder.com/300x200?text=Student+Photo';
    
    // Create modal
    currentEditModal = document.createElement('div');
    currentEditModal.className = 'student-edit-modal';
    currentEditModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Student</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="edit-student-name" value="${escapeHtml(name)}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="edit-student-description">${escapeHtml(description)}</textarea>
            </div>
            <div class="form-group">
                <label>Profile Image</label>
                <div class="image-preview">
                    <img id="edit-student-image" src="${imageSrc}" alt="Student">
                    <button id="change-image-btn">Change Image</button>
                    <input type="file" id="edit-image-upload" accept="image/*" style="display: none;">
                </div>
            </div>
            <div class="modal-actions">
                <button id="delete-student" class="btn-delete">Delete Student</button>
                <div>
                    <button id="cancel-edit" class="btn-cancel">Cancel</button>
                    <button id="save-student" class="btn-save">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(currentEditModal);
    
    // Add event listeners
    const closeModal = () => {
        currentEditModal.remove();
        currentEditModal = null;
    };
    
    currentEditModal.querySelector('.close-modal').addEventListener('click', closeModal);
    currentEditModal.querySelector('#cancel-edit').addEventListener('click', closeModal);
    
    // Handle image upload
    const imageUpload = currentEditModal.querySelector('#edit-image-upload');
    const imagePreview = currentEditModal.querySelector('#edit-student-image');
    
    currentEditModal.querySelector('#change-image-btn').addEventListener('click', () => {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle save
    currentEditModal.querySelector('#save-student').addEventListener('click', () => {
        const newName = currentEditModal.querySelector('#edit-student-name').value;
        const newDescription = currentEditModal.querySelector('#edit-student-description').value;
        const newImageSrc = imagePreview.src;
        
        // Update the card
        const nameEl = card.querySelector('h3');
        const descEl = card.querySelector('p');
        const imgEl = card.querySelector('img');
        
        if (nameEl) nameEl.textContent = newName;
        if (descEl) descEl.textContent = newDescription;
        if (imgEl) imgEl.src = newImageSrc;
        
        updateSaveStatus('Changes saved!', 'saved');
        closeModal();
    });
    
    // Handle delete
    currentEditModal.querySelector('#delete-student').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this student? This cannot be undone.')) {
            card.remove();
            updateSaveStatus('Student deleted', 'info');
            closeModal();
        }
    });
    
    // Close modal when clicking outside
    currentEditModal.addEventListener('click', (e) => {
        if (e.target === currentEditModal) {
            closeModal();
        }
    });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initAdminSystem();
});

// Add "Add Student" button to the students page
function addAddStudentButton() {
    const addButton = document.createElement('button');
    addButton.id = 'floating-add-student';
    addButton.title = 'Add New Student';
    addButton.innerHTML = '+';
    
    addButton.addEventListener('click', showAddStudentModal);
    
    document.body.appendChild(addButton);
    
    // Style the button
    const style = document.createElement('style');
    style.textContent = `
        #floating-add-student {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #3498db;
            color: white;
            border: none;
            font-size: 30px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        #floating-add-student:hover {
            background-color: #2980b9;
            transform: scale(1.1);
        }
        
        /* Modal styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        
        .modal-content {
            background: white;
            padding: 25px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .form-group input[type="text"],
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .image-upload-container {
            text-align: center;
            margin: 15px 0;
        }
        
        #student-image-preview {
            max-width: 100%;
            max-height: 200px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .btn-upload {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn-upload:hover {
            background-color: #2980b9;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        
        .btn-cancel, .btn-save {
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn-cancel {
            background-color: #e74c3c;
            color: white;
        }
        
        .btn-save {
            background-color: #2ecc71;
            color: white;
        }
        
        .btn-cancel:hover, .btn-save:hover {
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAdminSystem,
        enableAdminMode,
        saveAllChanges,
        undoLastChange,
        addNewStudentCard
    };
}
