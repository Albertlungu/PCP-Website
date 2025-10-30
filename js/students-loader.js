// students-loader.js - Dynamic student profile loader for Decap CMS

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        studentsDataPath: '/_data/students/',
        fallbackImage: '/images/placeholder-student.jpg'
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
     * Load all student profiles
     */
    async function loadStudents() {
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
     * Create HTML for a student card
     */
    function createStudentCard(student) {
        const imageSrc = student.image || CONFIG.fallbackImage;
        
        return `
            <div class="student-card">
                <div class="student-image-container">
                    <img src="${imageSrc}" alt="${student.name}" class="student-image" 
                         onerror="this.src='${CONFIG.fallbackImage}'">
                </div>
                <div class="student-info">
                    <h3 class="student-name">${student.name}</h3>
                    <p class="student-description">${student.description}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render students to the page
     */
    function renderStudents(students) {
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
    }

    /**
     * Initialize the students loader
     */
    async function init() {
        console.log('Loading students...');
        const students = await loadStudents();
        renderStudents(students);
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
