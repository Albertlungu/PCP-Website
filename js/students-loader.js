// students-loader.js - Dynamic student profile loader for Decap CMS + Admin Panel

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        studentsDataPath: '/_data/students/',
        fallbackImage: '/images/placeholder-student.jpg',
        localStorageKey: 'pcp_students_data' // Same key as admin panel
    };

    /**
     * Fetch and parse a markdown file
     */
    async function fetchMarkdownFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            return parseMarkdown(text);
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return null;
        }
    }

    /**
     * Parse markdown frontmatter and content
     */
    function parseMarkdown(text) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = text.match(frontmatterRegex);
        
        if (!match) {
            console.error('Invalid markdown format');
            return null;
        }

        const frontmatter = match[1];
        const content = match[2];

        // Parse frontmatter YAML
        const data = {};
        const lines = frontmatter.split('\n');
        
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;
            
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            // Convert order to number
            if (key === 'order') {
                value = parseInt(value, 10) || 0;
            }
            
            data[key] = value;
        }

        return data;
    }

    /**
     * Fetch list of student markdown files from GitHub API
     */
    async function fetchStudentsList() {
        const apiUrl = 'https://api.github.com/repos/Albertlungu/PCP-Website/contents/_data/students';
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error! status: ${response.status}`);
            }
            const files = await response.json();
            
            // Filter for .md files only
            return files
                .filter(file => file.name.endsWith('.md') && file.type === 'file')
                .map(file => file.name);
        } catch (error) {
            console.error('Error fetching students list:', error);
            return [];
        }
    }

    /**
     * Load students from localStorage (admin panel data)
     */
    function loadStudentsFromLocalStorage() {
        try {
            const savedData = localStorage.getItem(CONFIG.localStorageKey);
            if (savedData) {
                const students = JSON.parse(savedData);
                console.log(`Loaded ${students.length} student(s) from admin panel`);
                return students.map(student => ({
                    name: student.name,
                    description: student.bio,
                    image: student.image
                }));
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        return null;
    }

    /**
     * Load all student profiles
     */
    async function loadStudents() {
        // First, try to load from localStorage (admin panel)
        const localStudents = loadStudentsFromLocalStorage();
        if (localStudents && localStudents.length > 0) {
            console.log('Using students from admin panel');
            return localStudents;
        }

        // Fall back to GitHub API
        console.log('Loading students from GitHub...');
        const studentFiles = await fetchStudentsList();

        if (studentFiles.length === 0) {
            console.warn('No student files found');
            return [];
        }

        const students = [];

        for (const filename of studentFiles) {
            const url = `${CONFIG.studentsDataPath}${filename}`;
            const studentData = await fetchMarkdownFile(url);

            if (studentData) {
                students.push(studentData);
            }
        }

        // Sort by order field (ascending)
        students.sort((a, b) => (a.order || 0) - (b.order || 0));

        return students;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * Create HTML for a student card
     */
    function createStudentCard(student) {
        const imageSrc = student.image || CONFIG.fallbackImage;
        const name = escapeHtml(student.name);
        const description = escapeHtml(student.description);

        return `
            <div class="student-card">
                <div class="student-image">
                    <img src="${imageSrc}" alt="${name}"
                         onerror="this.src='${CONFIG.fallbackImage}'">
                </div>
                <div class="student-info">
                    <h3>${name}</h3>
                    <p>${description}</p>
                </div>
            </div>
        `;
    }

    /**
     * Show admin preview banner
     */
    function showAdminBanner() {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(212, 175, 55, 0.85));
            color: #1a1a2e;
            padding: 1rem;
            text-align: center;
            font-weight: 600;
            z-index: 100000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        banner.innerHTML = `
            📝 PREVIEW MODE: Viewing students from Admin Panel
            <a href="admin.html" style="color: #1a1a2e; text-decoration: underline; margin-left: 1rem;">Back to Admin</a>
        `;
        document.body.insertBefore(banner, document.body.firstChild);

        // Add padding to body to prevent content from hiding under banner
        document.body.style.paddingTop = '3.5rem';
    }

    /**
     * Render students to the page
     */
    function renderStudents(students, isFromLocalStorage = false) {
        const container = document.getElementById('students-grid');

        if (!container) {
            console.error('Students grid not found');
            return;
        }

        if (students.length === 0) {
            container.innerHTML = '<p class="no-students" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(245, 246, 255, 0.7);">No student profiles available yet.</p>';
            return;
        }

        const html = students.map(createStudentCard).join('');
        container.innerHTML = html;

        // Show banner if viewing admin data
        if (isFromLocalStorage) {
            showAdminBanner();
        }
    }

    /**
     * Initialize the students loader
     */
    async function init() {
        console.log('Loading students...');

        // Check if we have local data
        const hasLocalData = localStorage.getItem(CONFIG.localStorageKey) !== null;

        const students = await loadStudents();
        renderStudents(students, hasLocalData);
        console.log(`Loaded ${students.length} student(s)`);
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose reload function globally for manual refresh if needed
    window.reloadStudents = init;
})();
