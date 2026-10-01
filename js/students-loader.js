// students-loader.js - Renders student profiles on the Our Students page
//
// Published profiles live in /data/students.json, written by the admin panel.
// our-students.html?preview shows the admin's unpublished draft (from this browser) instead.

(function() {
    'use strict';

    const DATA_URL = '/data/students.json';
    const DRAFT_STORAGE_KEY = 'pcp_students_draft'; // Same key as js/admin-students.js

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Repo-relative image paths need a leading slash so they resolve from any page
    function imageSrc(image) {
        return image.startsWith('images/') ? `/${image}` : image;
    }

    function getInitials(name) {
        return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
    }

    function createStudentCard(student) {
        const name = escapeHtml(student.name);
        const initials = `<div class="placeholder-image"><span class="student-initials">${escapeHtml(getInitials(student.name))}</span></div>`;
        const media = student.image
            ? `<div class="student-image" data-initials="${escapeHtml(getInitials(student.name))}">
                    <img src="${escapeHtml(imageSrc(student.image))}" alt="${name}" loading="lazy">
               </div>`
            : initials;

        return `
            <div class="student-card">
                ${media}
                <div class="student-info">
                    <h3>${name}</h3>
                    <p>${escapeHtml(student.bio)}</p>
                </div>
            </div>
        `;
    }

    function loadDraft() {
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
            return Array.isArray(draft?.students) ? draft.students : null;
        } catch (error) {
            return null;
        }
    }

    async function loadPublished() {
        const response = await fetch(DATA_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return Array.isArray(data.students) ? data.students : [];
    }

    function showPreviewBanner() {
        const banner = document.createElement('div');
        banner.className = 'preview-banner';
        banner.innerHTML = 'Preview of unpublished changes. <a href="/admin/">Back to admin</a>';
        document.body.prepend(banner);
    }

    function showMessage(container, text) {
        container.innerHTML = `<p class="no-students" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(245, 246, 255, 0.7);">${text}</p>`;
    }

    async function init() {
        const container = document.getElementById('students-grid');
        if (!container) return;

        const isPreview = new URLSearchParams(window.location.search).has('preview');
        let students;

        if (isPreview && loadDraft()) {
            students = loadDraft();
            showPreviewBanner();
        } else {
            try {
                students = await loadPublished();
            } catch (error) {
                console.error('Error loading students:', error);
                showMessage(container, 'Student profiles could not be loaded right now. Please try again later.');
                return;
            }
        }

        if (students.length === 0) {
            showMessage(container, 'Student profiles are coming soon.');
            return;
        }

        container.innerHTML = students.map(createStudentCard).join('');

        // A broken photo falls back to the initials circle
        container.querySelectorAll('.student-image img').forEach(img => {
            img.addEventListener('error', () => {
                const wrapper = img.parentElement;
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder-image';
                placeholder.innerHTML = `<span class="student-initials">${escapeHtml(wrapper.dataset.initials)}</span>`;
                wrapper.replaceWith(placeholder);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
