/**
 * Vercel Serverless Function - Save Students to GitHub
 *
 * This function receives student data from the admin panel and commits
 * it directly to the GitHub repository using the GitHub API.
 *
 * Required Environment Variables (set in Vercel Dashboard):
 * - GITHUB_TOKEN: Personal Access Token with repo permissions
 * - GITHUB_OWNER: Repository owner (e.g., "Albertlungu")
 * - GITHUB_REPO: Repository name (e.g., "PCP-Website")
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        const { students } = req.body;

        if (!students || !Array.isArray(students)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: students array is required'
            });
        }

        // Get GitHub credentials from environment variables
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Albertlungu';
        const GITHUB_REPO = process.env.GITHUB_REPO || 'PCP-Website';
        const FILE_PATH = 'our-students.html';

        if (!GITHUB_TOKEN) {
            console.error('GITHUB_TOKEN not set');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: GitHub token not set. Please configure GITHUB_TOKEN in Vercel environment variables.'
            });
        }

        console.log(`Updating ${students.length} student(s) in ${GITHUB_OWNER}/${GITHUB_REPO}`);

        // Step 1: Get the current file content and SHA
        const getFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

        const getResponse = await fetch(getFileUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'PCP-Website-Admin'
            }
        });

        if (!getResponse.ok) {
            const errorData = await getResponse.json();
            console.error('GitHub API error:', errorData);
            return res.status(500).json({
                success: false,
                error: `Failed to fetch file from GitHub: ${errorData.message}`
            });
        }

        const fileData = await getResponse.json();
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const currentSha = fileData.sha;

        // Step 2: Generate new student cards HTML
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

        // Step 3: Replace the students-grid section in the HTML
        // This regex matches the opening div, all content inside, and the closing div
        // but NOT the closing div of the parent container
        const regex = /<div class="students-grid" id="students-grid">\s*(?:<div class="student-card">[\s\S]*?<\/div>\s*)*<\/div>/;
        const updatedContent = currentContent.replace(regex, studentsHTML);

        // Check if content actually changed
        if (updatedContent === currentContent) {
            return res.status(200).json({
                success: true,
                message: 'No changes detected',
                committed: false
            });
        }

        // Step 4: Commit the updated file back to GitHub
        const timestamp = new Date().toISOString();
        const commitMessage = `Update student profiles - ${timestamp}

🤖 Generated with Admin Panel
Automated commit from Vercel deployment`;

        const updateFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

        const updateResponse = await fetch(updateFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'PCP-Website-Admin'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: Buffer.from(updatedContent).toString('base64'),
                sha: currentSha,
                branch: 'main' // or 'master' depending on your default branch
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('GitHub commit error:', errorData);
            return res.status(500).json({
                success: false,
                error: `Failed to commit to GitHub: ${errorData.message}`
            });
        }

        const commitData = await updateResponse.json();

        console.log('✅ Successfully committed to GitHub');
        console.log('Commit SHA:', commitData.commit.sha);

        return res.status(200).json({
            success: true,
            message: 'Students updated and committed to GitHub!',
            committed: true,
            commitSha: commitData.commit.sha,
            deployInfo: 'Changes will be live on Vercel in ~2 minutes'
        });

    } catch (error) {
        console.error('Error in save-students function:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
