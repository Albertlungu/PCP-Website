/**
 * Admin panel for student profiles (admin/index.html).
 *
 * Flow:
 *   1. Sign in: the password is checked in the browser against ADMIN_PASSWORD and kept for this tab only.
 *   2. The published list is loaded from /data/students.json, so every browser starts from the live data.
 *   3. Edits are kept as a draft in localStorage until published; our-students.html?preview shows the draft.
 *   4. Publish sends the list to /api/save-students, which commits data/students.json and photos to GitHub.
 */

const DATA_URL = '../data/students.json'; // Relative so it also resolves under /PCP-Website/ on GitHub Pages
const API_URL = '/api/save-students';
const DRAFT_STORAGE_KEY = 'pcp_students_draft'; // Also read by js/students-loader.js for ?preview
const PASSWORD_SESSION_KEY = 'pcp_admin_password';
// Deliberately insecure: GitHub Pages is static, so the password can only be checked client-side
const ADMIN_PASSWORD = '12345678';
const MAX_HISTORY_ITEMS = 50;
const IMAGE_TARGET_HEIGHT = 500;

/** @type {Array<{name: string, bio: string, image: string}>} Last published list */
let published = [];

/** @type {Array<{name: string, bio: string, image: string}>} Working copy being edited */
let students = [];

/** @type {number} Index being edited in the modal, or -1 when adding */
let currentEditingIndex = -1;

/** @type {Array<{timestamp: string, label: string, students: Array}>} Undo/redo snapshots (this tab only) */
let historyStack = [];
let historyPosition = -1;

let isPublishing = false;

document.addEventListener('DOMContentLoaded', async () => {
    initializeEventListeners();
    const signedIn = await ensureSignedIn();
    if (signedIn) await loadData();
});

// ============================================================================
// SIGN-IN
// ============================================================================

function getPassword() {
    return sessionStorage.getItem(PASSWORD_SESSION_KEY);
}

async function ensureSignedIn() {
    if (getPassword()) return true;
    showLoginModal();
    return false;
}

function showLoginModal(message = '') {
    const modal = document.getElementById('loginModal');
    document.getElementById('loginError').textContent = message;
    modal.classList.add('active');
    document.body.classList.add('signed-out');
    setTimeout(() => document.getElementById('adminPassword').focus(), 50);
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('adminPassword');
    const password = input.value;
    if (!password) return;

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(PASSWORD_SESSION_KEY, password);
        document.getElementById('loginModal').classList.remove('active');
        document.body.classList.remove('signed-out');
        input.value = '';
        await loadData();
    } else {
        document.getElementById('loginError').textContent = 'Incorrect password.';
    }
}

function signOut() {
    sessionStorage.removeItem(PASSWORD_SESSION_KEY);
    window.location.href = '/';
}

// ============================================================================
// DATA
// ============================================================================

async function loadData() {
    try {
        const response = await fetch(DATA_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        published = Array.isArray(data.students) ? data.students : [];
    } catch (error) {
        notify(`Could not load the published students (${error.message}). Reload to try again.`, 'error');
        published = [];
    }

    const draft = readDraft();
    students = clone(draft ? draft.students : published);

    historyStack = [];
    historyPosition = -1;
    pushHistory('Opened');

    renderStudents();
    updateStatus();
}

function readDraft() {
    try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
        return Array.isArray(draft?.students) ? draft : null;
    } catch (error) {
        return null;
    }
}

function writeDraft() {
    if (sameStudents(students, published)) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
    }
    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), students }));
    } catch (error) {
        // Photos are stored inline until published, so a large draft can exceed the browser quota
        notify('This draft is too large to keep in the browser. Publish soon so your changes are not lost.', 'error');
    }
}

function hasUnpublishedChanges() {
    return !sameStudents(students, published);
}

function sameStudents(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

/** Record a change: snapshot for undo, persist the draft, refresh the UI */
function commitChange(label) {
    pushHistory(label);
    writeDraft();
    renderStudents();
    updateStatus();
}

// ============================================================================
// UNDO / REDO / HISTORY
// ============================================================================

function pushHistory(label) {
    historyStack = historyStack.slice(0, historyPosition + 1);
    historyStack.push({ timestamp: new Date().toISOString(), label, students: clone(students) });
    if (historyStack.length > MAX_HISTORY_ITEMS) historyStack.shift();
    historyPosition = historyStack.length - 1;
    updateUndoRedoButtons();
}

function restoreHistory(position) {
    historyPosition = position;
    students = clone(historyStack[position].students);
    writeDraft();
    renderStudents();
    updateStatus();
    updateUndoRedoButtons();
}

function undo() {
    if (historyPosition > 0) restoreHistory(historyPosition - 1);
}

function redo() {
    if (historyPosition < historyStack.length - 1) restoreHistory(historyPosition + 1);
}

function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = historyPosition <= 0;
    document.getElementById('redoBtn').disabled = historyPosition >= historyStack.length - 1;
}

function showHistoryModal() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    historyStack.slice().reverse().forEach((entry, reverseIndex) => {
        const index = historyStack.length - 1 - reverseIndex;
        const item = document.createElement('div');
        item.className = 'history-item' + (index === historyPosition ? ' active' : '');
        item.innerHTML = `
            <div class="history-info">
                <strong>${escapeHtml(entry.label)}</strong>
                <span>${new Date(entry.timestamp).toLocaleTimeString()} &middot; ${entry.students.length} student(s)</span>
            </div>
            <button class="restore-btn">${index === historyPosition ? 'Current' : 'Restore'}</button>
        `;
        const button = item.querySelector('.restore-btn');
        button.disabled = index === historyPosition;
        button.addEventListener('click', () => {
            restoreHistory(index);
            closeModalById('historyModal');
        });
        historyList.appendChild(item);
    });

    document.getElementById('historyModal').classList.add('active');
}

// ============================================================================
// PUBLISH
// ============================================================================

async function publish() {
    if (isPublishing) return;
    if (!hasUnpublishedChanges()) {
        notify('Nothing to publish. The live site already matches this list.');
        return;
    }

    const count = students.length;
    const prompt = count === 0
        ? 'This will remove ALL students from the live site. Publish an empty list?'
        : `Publish ${count} student${count === 1 ? '' : 's'} to the live site?`;
    if (!confirm(prompt)) return;

    const button = document.getElementById('publishBtn');
    isPublishing = true;
    button.disabled = true;
    button.textContent = 'Publishing…';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: getPassword(), students })
        });
        const result = await response.json().catch(() => ({}));

        if (response.status === 401) {
            sessionStorage.removeItem(PASSWORD_SESSION_KEY);
            showLoginModal('Your session expired. Sign in again, then publish.');
            return;
        }
        if (!response.ok || !result.success) {
            throw new Error(result.error || `HTTP ${response.status}`);
        }

        // The server swaps uploaded photos for file paths; adopt its version as the new baseline
        published = result.students;
        students = clone(published);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        historyStack = [];
        historyPosition = -1;
        pushHistory('Published');
        renderStudents();
        updateStatus();
        notify(result.message || 'Published.', 'success');
    } catch (error) {
        notify(`Publishing failed: ${error.message}`, 'error');
    } finally {
        isPublishing = false;
        button.disabled = false;
        button.textContent = 'Publish';
    }
}

function discardDraft() {
    if (!confirm('Discard all unpublished changes and go back to the live version?')) return;
    students = clone(published);
    commitChange('Discarded changes');
}

function updateStatus() {
    const dirty = hasUnpublishedChanges();
    const badge = document.getElementById('modeBadge');
    badge.textContent = dirty ? 'Unpublished changes' : 'Up to date';
    badge.classList.toggle('dirty', dirty);
    document.getElementById('discardBtn').hidden = !dirty;
}

// ============================================================================
// EDIT MODAL
// ============================================================================

function openModal(index = -1) {
    currentEditingIndex = index;
    const editing = index >= 0 && index < students.length;
    const student = editing ? students[index] : { image: '', name: '', bio: '' };

    document.getElementById('modalTitle').textContent = editing ? 'Edit Student' : 'Add Student';
    // Set every field explicitly: form.reset() does not clear hidden inputs
    document.getElementById('imageUrl').value = student.image;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentBio').value = student.bio;
    document.getElementById('imageFileInput').value = '';
    updateImagePreview();

    document.getElementById('editModal').classList.add('active');
    setTimeout(() => document.getElementById('studentName').focus(), 50);
}

function closeModal() {
    closeModalById('editModal');
    currentEditingIndex = -1;
}

function closeModalById(id) {
    document.getElementById(id).classList.remove('active');
}

function handleFormSubmit(event) {
    event.preventDefault();

    const image = document.getElementById('imageUrl').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const bio = document.getElementById('studentBio').value.trim();

    if (!image) {
        alert('Please add a photo (choose a file or paste an image).');
        return;
    }
    if (!name || !bio) {
        alert('Please fill in both the name and the description.');
        return;
    }

    const studentData = { name, bio, image };
    if (currentEditingIndex >= 0) {
        students[currentEditingIndex] = studentData;
        commitChange(`Edited ${name}`);
    } else {
        students.push(studentData);
        commitChange(`Added ${name}`);
    }
    closeModal();
}

function deleteStudent(index) {
    const name = students[index].name;
    if (!confirm(`Delete ${name}? You can undo this until you publish.`)) return;
    students.splice(index, 1);
    commitChange(`Deleted ${name}`);
}

function moveStudent(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= students.length) return;
    [students[index], students[target]] = [students[target], students[index]];
    commitChange(`Moved ${students[target].name}`);
}

function clearAll() {
    if (students.length === 0) return;
    if (!confirm('Remove every student from this draft? Nothing changes on the live site until you publish, and you can undo this.')) return;
    students = [];
    commitChange('Cleared all');
}

// ============================================================================
// IMAGES
// ============================================================================

/** Resize to IMAGE_TARGET_HEIGHT (never upscale) and re-encode as JPEG */
function scaleImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, IMAGE_TARGET_HEIGHT / img.height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = () => reject(new Error('This file could not be read as an image.'));
        img.src = dataUrl;
    });
}

function processImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (JPG, PNG, or WebP).');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert('That image is larger than 10 MB. Please choose a smaller one.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            document.getElementById('imageUrl').value = await scaleImage(event.target.result);
            updateImagePreview();
        } catch (error) {
            alert(error.message);
        }
    };
    reader.onerror = () => alert('Error reading the image file. Please try again.');
    reader.readAsDataURL(file);
}

function handleImagePaste(event) {
    const items = event.clipboardData?.items || [];
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            event.preventDefault();
            processImageFile(item.getAsFile());
            return;
        }
    }
}

function updateImagePreview() {
    const image = document.getElementById('imageUrl').value;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    if (image) {
        const img = document.createElement('img');
        img.src = imageSrc(image);
        img.alt = 'Preview';
        img.addEventListener('error', () => {
            preview.innerHTML = '<span class="preview-placeholder">This image could not be loaded</span>';
        });
        preview.appendChild(img);
        preview.classList.add('has-image');
    } else {
        preview.innerHTML = '<span class="preview-placeholder">Paste an image here or choose a file</span>';
        preview.classList.remove('has-image');
    }
}

/** Repo-relative paths ("images/students/...") need a leading slash from /admin/ */
function imageSrc(image) {
    return image.startsWith('images/') ? `/${image}` : image;
}

// ============================================================================
// RENDERING
// ============================================================================

function renderStudents() {
    const grid = document.getElementById('studentsGrid');
    grid.innerHTML = '';

    if (students.length === 0) {
        grid.innerHTML = '<p class="no-history">No students yet. Use "Add New Student" below.</p>';
        return;
    }

    students.forEach((student, index) => grid.appendChild(createStudentCard(student, index)));
}

function createStudentCard(student, index) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
        <div class="student-image">
            <img src="${escapeHtml(imageSrc(student.image))}" alt="${escapeHtml(student.name)}">
        </div>
        <div class="student-info">
            <h3>${escapeHtml(student.name)}</h3>
            <p>${escapeHtml(student.bio)}</p>
        </div>
        <div class="student-actions">
            <button class="action-btn move-btn" data-action="up" title="Move earlier" ${index === 0 ? 'disabled' : ''}>&uarr;</button>
            <button class="action-btn move-btn" data-action="down" title="Move later" ${index === students.length - 1 ? 'disabled' : ''}>&darr;</button>
            <button class="action-btn edit-btn" data-action="edit">Edit</button>
            <button class="action-btn delete-btn" data-action="delete">Delete</button>
        </div>
    `;

    card.querySelector('.student-actions').addEventListener('click', (event) => {
        const action = event.target.closest('button')?.dataset.action;
        if (action === 'edit') openModal(index);
        if (action === 'delete') deleteStudent(index);
        if (action === 'up') moveStudent(index, -1);
        if (action === 'down') moveStudent(index, 1);
    });

    return card;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function notify(message, type = 'info') {
    document.querySelector('.save-notification')?.remove();

    const notification = document.createElement('div');
    notification.className = `save-notification ${type}`;
    notification.setAttribute('role', 'status');
    notification.innerHTML = `<div class="notification-content"><span class="notification-text"></span></div>`;
    notification.querySelector('.notification-text').textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    // Errors stay longer so they can be read
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, type === 'error' ? 9000 : 4500);
}

// ============================================================================
// EVENT WIRING
// ============================================================================

function initializeEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    document.getElementById('signOutBtn').addEventListener('click', signOut);

    document.getElementById('addStudentBtn').addEventListener('click', () => openModal());
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
    document.getElementById('discardBtn').addEventListener('click', discardDraft);
    document.getElementById('publishBtn').addEventListener('click', publish);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('historyBtn').addEventListener('click', showHistoryModal);
    document.getElementById('historyModalClose').addEventListener('click', () => closeModalById('historyModal'));

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    // Paste works anywhere while the edit dialog is open, not only when a form field has focus
    document.addEventListener('paste', (event) => {
        if (document.getElementById('editModal').classList.contains('active')) handleImagePaste(event);
    });

    const preview = document.getElementById('imagePreview');
    preview.addEventListener('dragover', (event) => {
        event.preventDefault();
        preview.classList.add('dragging');
    });
    preview.addEventListener('dragleave', () => preview.classList.remove('dragging'));
    preview.addEventListener('drop', (event) => {
        event.preventDefault();
        preview.classList.remove('dragging');
        processImageFile(event.dataTransfer.files[0]);
    });

    const fileInput = document.getElementById('imageFileInput');
    document.getElementById('uploadFileBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (event) => processImageFile(event.target.files[0]));

    // Clicking the dimmed backdrop closes edit/history dialogs (never the sign-in dialog)
    ['editModal', 'historyModal'].forEach(id => {
        const modal = document.getElementById(id);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) id === 'editModal' ? closeModal() : closeModalById(id);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
            closeModalById('historyModal');
        }
        const mod = event.metaKey || event.ctrlKey;
        const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
        if (mod && !typing && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            event.shiftKey ? redo() : undo();
        }
    });

    window.addEventListener('beforeunload', (event) => {
        if (isPublishing) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
}
