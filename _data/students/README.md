# Students Data Folder

This folder contains student profile files in Markdown format.

## File Format

Each student is a `.md` file with YAML frontmatter:

```markdown
---
name: "Student Name"
description: "Brief description of the student and their musical background."
image: "/images/students/photo.jpg"
order: 0
---
```

## Fields

- **name**: Student's full name (required)
- **description**: Short bio or description (required)
- **image**: Path to student's photo (optional)
  - Photos should be in `/images/students/`
  - Use format: `"/images/students/filename.jpg"`
  - Leave empty (`""`) if no photo
- **order**: Display order on the page (required)
  - Lower numbers appear first
  - Use integers: 0, 1, 2, 3...

## Editing

### Via Decap CMS (Recommended)
1. Visit `/admin` on your website
2. Log in with GitHub
3. Click "Students"
4. Add/edit/delete students visually

### Manually
1. Create a new `.md` file in this folder
2. Use the format above
3. Commit and push to GitHub
4. Wait for Vercel to rebuild

## Image Guidelines

- Recommended size: 400x400 pixels
- Format: JPG or PNG
- File size: Under 500KB for fast loading
- Square aspect ratio works best

## Example

See `sample-student.md` in this folder for a working example.
