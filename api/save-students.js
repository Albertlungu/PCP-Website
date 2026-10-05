/**
 * Vercel serverless function: publish student profiles.
 *
 * POST /api/save-students
 *   { password, verify: true }           -> checks the password only (used by the admin login screen)
 *   { password, students: [...] }        -> commits data/students.json (and any new photos) to GitHub
 *
 * Each student is { name, bio, image }, where image is either a path already in the repo
 * (e.g. "images/students/jacob-kang-1a2b3c4d.jpg") or a data URL for a newly uploaded photo.
 * New photos are written to images/students/, photos no longer referenced are deleted, and
 * everything lands in a single commit so Vercel redeploys once.
 *
 * Vercel environment variables:
 *   ADMIN_PASSWORD  - password the admin panel must send (falls back to a hardcoded default)
 *   GITHUB_TOKEN    - fine-grained token with Contents read/write on this repository only (required to publish)
 * Optional: GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
 */

import crypto from 'crypto';

const DATA_PATH = 'data/students.json';
const IMAGES_DIR = 'images/students';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const MAX_STUDENTS = 100;

export default async function handler(req, res) {
    // Same-origin only: the admin panel is served from this site, so no CORS headers are sent
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    // Deliberately insecure default so the admin works without any Vercel configuration
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345678';
    const { GITHUB_TOKEN } = process.env;

    const body = req.body || {};
    if (!passwordMatches(body.password, ADMIN_PASSWORD)) {
        return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    if (body.verify) {
        return res.status(200).json({ success: true });
    }

    if (!GITHUB_TOKEN) {
        return res.status(500).json({
            success: false,
            error: 'Server is not configured: set GITHUB_TOKEN in Vercel environment variables.'
        });
    }

    let students;
    try {
        students = validateStudents(body.students);
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }

    const github = createGitHubClient({
        token: GITHUB_TOKEN,
        owner: process.env.GITHUB_OWNER || 'Albertlungu',
        repo: process.env.GITHUB_REPO || 'PCP-Website',
        branch: process.env.GITHUB_BRANCH || 'main'
    });

    try {
        const result = await publish(github, students);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error('Publish failed:', error);
        const status = error.status >= 400 && error.status < 500 ? error.status : 500;
        return res.status(status).json({ success: false, error: error.message || 'Publishing failed.' });
    }
}

function passwordMatches(given, expected) {
    if (typeof given !== 'string') return false;
    // Hash both sides so timingSafeEqual gets equal-length buffers
    const a = crypto.createHash('sha256').update(given).digest();
    const b = crypto.createHash('sha256').update(expected).digest();
    return crypto.timingSafeEqual(a, b);
}

function validateStudents(students) {
    if (!Array.isArray(students)) {
        throw new Error('Invalid request: students must be an array.');
    }
    if (students.length > MAX_STUDENTS) {
        throw new Error(`Too many students (maximum ${MAX_STUDENTS}).`);
    }
    return students.map((student, index) => {
        const name = typeof student?.name === 'string' ? student.name.trim() : '';
        const bio = typeof student?.bio === 'string' ? student.bio.trim() : '';
        const image = typeof student?.image === 'string' ? student.image.trim() : '';
        if (!name || !bio) {
            throw new Error(`Student #${index + 1} is missing a name or description.`);
        }
        if (image.startsWith('data:image/')) {
            // Decode now so a bad upload is rejected before anything is sent to GitHub
            return { name, bio, image, upload: decodeImage(image, name) };
        }
        if (image && !image.startsWith(`${IMAGES_DIR}/`) && !/^https:\/\//.test(image)) {
            throw new Error(`Student "${name}" has an invalid image reference.`);
        }
        return { name, bio, image };
    });
}

async function publish(github, students) {
    const headSha = await github.getBranchSha();
    const headCommit = await github.request(`git/commits/${headSha}`);

    const treeEntries = [];
    const keptImages = new Set();

    // Write newly uploaded photos as files and point the student at the file path
    const published = [];
    for (const student of students) {
        let image = student.image;
        if (student.upload) {
            const { buffer, extension } = student.upload;
            const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 8);
            image = `${IMAGES_DIR}/${slugify(student.name)}-${hash}.${extension}`;
            const blob = await github.request('git/blobs', {
                method: 'POST',
                body: { content: buffer.toString('base64'), encoding: 'base64' }
            });
            treeEntries.push({ path: image, mode: '100644', type: 'blob', sha: blob.sha });
        }
        if (image.startsWith(`${IMAGES_DIR}/`)) keptImages.add(image);
        published.push({ name: student.name, bio: student.bio, image });
    }

    // Remove photos that no student references anymore
    for (const path of await github.listFiles(IMAGES_DIR)) {
        if (!keptImages.has(path) && !treeEntries.some(entry => entry.path === path)) {
            treeEntries.push({ path, mode: '100644', type: 'blob', sha: null });
        }
    }

    treeEntries.push({
        path: DATA_PATH,
        mode: '100644',
        type: 'blob',
        content: JSON.stringify({ students: published }, null, 2) + '\n'
    });

    const tree = await github.request('git/trees', {
        method: 'POST',
        body: { base_tree: headCommit.tree.sha, tree: treeEntries }
    });

    if (tree.sha === headCommit.tree.sha) {
        return { committed: false, message: 'No changes to publish.', students: published };
    }

    const commit = await github.request('git/commits', {
        method: 'POST',
        body: {
            message: `Update student profiles (${published.length} student${published.length === 1 ? '' : 's'})\n\nPublished from the admin panel.`,
            tree: tree.sha,
            parents: [headSha]
        }
    });

    // Not forced: if someone else pushed in the meantime, GitHub rejects this and nothing is lost
    await github.request(`git/refs/heads/${github.branch}`, {
        method: 'PATCH',
        body: { sha: commit.sha, force: false }
    });

    return {
        committed: true,
        commitSha: commit.sha,
        message: 'Published. The live site updates in about two minutes.',
        students: published
    };
}

function decodeImage(dataUrl, name) {
    const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
        throw httpError(400, `The photo for "${name}" must be a JPEG, PNG, or WebP image.`);
    }
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > MAX_IMAGE_BYTES) {
        throw httpError(400, `The photo for "${name}" is too large (maximum 1.5 MB).`);
    }
    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    return { buffer, extension };
}

function slugify(text) {
    return text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'student';
}

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function createGitHubClient({ token, owner, repo, branch }) {
    const base = `https://api.github.com/repos/${owner}/${repo}/`;

    async function request(path, { method = 'GET', body } = {}) {
        const response = await fetch(base + path, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'PCP-Website-Admin',
                ...(body ? { 'Content-Type': 'application/json' } : {})
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) {
            const details = await response.json().catch(() => ({}));
            // 422 on a ref update means the branch moved since we read it
            const status = response.status === 422 && path.startsWith('git/refs') ? 409 : response.status;
            const message = status === 409
                ? 'The site was updated by someone else while you were editing. Reload the admin panel and try again.'
                : `GitHub API error (${response.status}): ${details.message || response.statusText}`;
            throw httpError(status, message);
        }
        return response.status === 204 ? null : response.json();
    }

    return {
        branch,
        request,
        async getBranchSha() {
            const ref = await request(`git/ref/heads/${branch}`);
            return ref.object.sha;
        },
        async listFiles(dir) {
            try {
                const entries = await request(`contents/${dir}?ref=${branch}`);
                return entries
                    .filter(entry => entry.type === 'file' && /\.(jpe?g|png|webp)$/i.test(entry.name))
                    .map(entry => entry.path);
            } catch (error) {
                if (error.status === 404) return [];
                throw error;
            }
        }
    };
}
