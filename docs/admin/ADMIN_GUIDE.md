# PCP Website Admin Guide

This guide explains how to use the admin system for managing the PCP website content.

## Accessing the Admin Interface

1. Add `#admin` to the website URL (e.g., `http://localhost:3000/#admin`)
2. When prompted, enter the admin password: `Michael Van der Sloot`
3. The admin toolbar will appear at the top of the page

## Features

### Text Editing
- Click on any text element to edit it directly
- Changes are highlighted with a red outline
- Press Enter or click outside to save changes

### Image Management
- Hover over an image to see the edit overlay
- Click to upload a new image from your computer
- Images are stored in the browser's local storage

### Student Cards
- **Add a new card**: Click the "+ Add Student Card" button
- **Remove a card**: Click the × button in the top-right corner of a card
- **Edit content**: Click on any text or image to edit

### Saving Changes
- Click the "💾 Save Changes" button to save all changes
- Changes are saved to the browser's local storage
- A confirmation message will appear when changes are saved

### Undo Changes
- Click the "↩️ Undo" button to revert the last change
- The system keeps a history of up to 50 changes

## File Structure

```
PCP-Website/
├── css/
│   ├── styles.css       # Main styles
│   └── admin.css        # Admin interface styles
├── js/
│   ├── admin.js        # Admin functionality
│   └── script.js       # Main JavaScript
├── html/               # Additional HTML pages
├── images/             # Image assets
└── index.html          # Main page
```

## Development

### Running Locally

1. Install Node.js if you haven't already
2. Run `node migrate-to-new-structure.js` to set up the file structure
3. The script will start a local server at http://localhost:3000

### Making Changes

1. Edit the HTML files in the `html/` directory
2. Update styles in `css/styles.css`
3. Add JavaScript functionality in `js/`
4. Test your changes locally before deploying

## Notes

- The admin system uses the browser's local storage to save changes
- For a production environment, consider implementing a backend solution
- Always back up your data before making major changes
- The password is stored in plain text in the JavaScript code (not secure for production use)
