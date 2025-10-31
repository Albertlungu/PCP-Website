#!/usr/bin/env node

/**
 * Admin Auto-Save Server
 * Allows the admin panel to automatically update our-students.html
 *
 * Usage: node admin-server.js
 * Then access: http://localhost:3000/admin.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execSync } = require('child_process');

const PORT = 3000;
const ROOT_DIR = __dirname;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
};

/**
 * Serve static files
 */
function serveStaticFile(filePath, res) {
    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

/**
 * Check if this is a Git repository
 */
function isGitRepo() {
    try {
        execSync('git rev-parse --is-inside-work-tree', {
            cwd: ROOT_DIR,
            stdio: 'ignore'
        });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Auto-commit and push to Git
 */
function autoCommitAndPush(callback) {
    if (!isGitRepo()) {
        console.log('⚠️  Not a Git repository. Skipping auto-commit.');
        return callback(null, false);
    }

    try {
        console.log('📦 Auto-committing to Git...');

        // Stage the our-students.html file
        execSync('git add our-students.html', { cwd: ROOT_DIR });

        // Create commit with timestamp
        const timestamp = new Date().toISOString();
        const commitMessage = `Update student profiles - ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

        execSync(`git commit -m "${commitMessage}"`, {
            cwd: ROOT_DIR,
            stdio: 'ignore'
        });

        console.log('✅ Committed to Git');

        // Try to push to remote
        try {
            console.log('🚀 Pushing to remote...');
            execSync('git push', {
                cwd: ROOT_DIR,
                timeout: 10000 // 10 second timeout
            });
            console.log('✅ Pushed to remote! Vercel will auto-deploy in ~2 minutes.');
            return callback(null, true);
        } catch (pushError) {
            console.log('⚠️  Could not push to remote. You may need to push manually.');
            console.log('   Run: git push');
            return callback(null, true);
        }

    } catch (error) {
        // If no changes to commit
        if (error.message && error.message.includes('nothing to commit')) {
            console.log('ℹ️  No changes detected');
            return callback(null, false);
        }

        console.error('⚠️  Git error:', error.message);
        return callback(null, false);
    }
}

/**
 * Update our-students.html with new student data
 */
function updateStudentsPage(students, autoCommit, callback) {
    const studentsFilePath = path.join(ROOT_DIR, 'our-students.html');

    // Read the current file
    fs.readFile(studentsFilePath, 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }

        // Generate the student cards HTML
        let studentsHTML = '            <div class="students-grid" id="students-grid">\n';

        students.forEach(student => {
            studentsHTML += `                <div class="student-card">\n`;
            studentsHTML += `                    <div class="student-image">\n`;
            studentsHTML += `                        <img src="${escapeHtml(student.image)}" alt="${escapeHtml(student.name)}">\n`;
            studentsHTML += `                    </div>\n`;
            studentsHTML += `                    <div class="student-info">\n`;
            studentsHTML += `                        <h3>${escapeHtml(student.name)}</h3>\n`;
            studentsHTML += `                        <p>${escapeHtml(student.bio)}</p>\n`;
            studentsHTML += `                    </div>\n`;
            studentsHTML += `                </div>\n`;
        });

        studentsHTML += '            </div>';

        // Replace the students-grid section
        // Match the opening div with id="students-grid" and everything until its closing div
        const regex = /<div class="students-grid" id="students-grid">[\s\S]*?<\/div>(\s*<\/div>)/;

        const updatedHTML = data.replace(regex, studentsHTML + '\n        </div>');

        // Write the updated file
        fs.writeFile(studentsFilePath, updatedHTML, 'utf8', (err) => {
            if (err) {
                return callback(err);
            }

            // Auto-commit if requested
            if (autoCommit) {
                autoCommitAndPush((err, committed) => {
                    callback(null, committed);
                });
            } else {
                callback(null, false);
            }
        });
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Create HTTP server
 */
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API endpoint to save students
    if (pathname === '/api/save-students' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const students = data.students;
                const autoCommit = data.autoCommit !== false; // Default to true

                console.log(`\n📝 Saving ${students.length} student(s) to our-students.html...`);

                updateStudentsPage(students, autoCommit, (err, committed) => {
                    if (err) {
                        console.error('❌ Error saving students:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: err.message
                        }));
                    } else {
                        console.log('✅ Successfully updated our-students.html!');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: 'Students page updated successfully!',
                            committed: committed,
                            deployInfo: committed ? 'Changes will be live on Vercel in ~2 minutes' : null
                        }));
                    }
                });
            } catch (err) {
                console.error('❌ Error parsing request:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Invalid JSON'
                }));
            }
        });

        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(ROOT_DIR, filePath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    serveStaticFile(filePath, res);
});

// Start server
server.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🎵 UOttawa Pre-College Admin Server                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Server running at: http://localhost:${PORT}`);
    console.log(`\n📂 Serving files from: ${ROOT_DIR}`);
    console.log(`\n🎯 Access admin panel: http://localhost:${PORT}/admin.html`);
    console.log('\n💡 The admin panel can now automatically save changes!');
    console.log('\n⚠️  Press Ctrl+C to stop the server\n');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${PORT} is already in use.`);
        console.error('   Please close the other application or change the port.\n');
    } else {
        console.error('\n❌ Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed successfully\n');
        process.exit(0);
    });
});
