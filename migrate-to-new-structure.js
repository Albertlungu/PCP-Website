// This script helps migrate the project to the new organized structure
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const directories = [
    'css',
    'js',
    'images',
    'html'
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});

// Move CSS files
const cssFiles = fs.readdirSync('.').filter(file => file.endsWith('.css'));
cssFiles.forEach(file => {
    fs.renameSync(file, path.join('css', file));
    console.log(`Moved ${file} to css/`);
});

// Move JS files
const jsFiles = fs.readdirSync('.').filter(file => file.endsWith('.js') && file !== 'migrate-to-new-structure.js');
jsFiles.forEach(file => {
    fs.renameSync(file, path.join('js', file));
    console.log(`Moved ${file} to js/`);
});

// Move HTML files (except index.html)
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html') && file !== 'index.html');
htmlFiles.forEach(file => {
    fs.renameSync(file, path.join('html', file));
    console.log(`Moved ${file} to html/`);
});

console.log('Migration complete!');
console.log('Please update the following in your HTML files:');
console.log('1. Update CSS file paths to point to the new location (e.g., "css/styles.css")');
console.log('2. Update JavaScript file paths to point to the new location (e.g., "js/script.js")');
console.log('3. Update image paths if necessary');

// Create a simple server for local development
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    let contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: '+error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Visit http://localhost:${port}/#admin to access admin mode`);
});
