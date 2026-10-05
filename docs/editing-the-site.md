# Editing the site

## Previewing your changes

Open a terminal in the repository folder and run:

```
python3 -m http.server 8000
```

then open http://localhost:8000/ in a browser. Stop it with Ctrl+C when you are done. Opening the HTML
files directly (double-clicking them) does not work well, because the browser blocks some of the
requests the pages make.

Everything except publishing in the admin panel works this way. The pages read the live Google
Sheet, so what you see is real data.

## How a page is put together

Every page is a complete HTML file. There is no template system, so the **navigation bar and the
footer are copied into every page**. If you change a menu item, change it in all of them:
`index.html` and every file in `html/`. Searching the repository for the old link text finds them all.

Links between pages are relative to the page they are in. From a page in `html/program/`:

- another page in the same folder: `schedule.html`
- a page in another folder: `../participate/calendar.html`
- the home page: `../../index.html`
- the stylesheet: `../../css/site.css`

Never start a link with `/`. The site is served from a domain root on Vercel but from
`/PCP-Website/` on GitHub Pages, and a leading `/` breaks one of the two. For the same reason,
links built inside JavaScript use `sitePath('html/participate/calendar.html')` (defined in
`js/shared/config.js`), which works out the right address on either host.

Each page ends with its scripts, always in this order:

```html
<script src="../../js/shared/config.js"></script>     <!-- settings; must be first -->
<script src="../../js/shared/signup-gate.js"></script>
<script src="../../js/shared/site.js"></script>
<!-- then whatever the page needs, for example: -->
<script src="../../js/shared/sheets.js"></script>     <!-- before chamber-rooms.js or snacks.js -->
<script src="../../js/snacks.js"></script>
```

Sections filled in from the Google Sheet are empty placeholders in the HTML with an `id`, such as
`<div id="snack-schedule">`. The script looks for that `id`, so a page can include a section just
by containing the placeholder and loading the script.

| Placeholder | Filled by | Used on |
| --- | --- | --- |
| `id="next-event"` | `js/calendar.js` | home |
| `id="calendar-grid"` and the views around it | `js/calendar.js` | calendar |
| `data-season="all"` / `"masterclass"` / `"performance"` | `js/calendar.js` | schedule, masterclasses, performance class |
| `id="week-rooms"` | `js/chamber-rooms.js` | home |
| `id="chamber-rooms-table"` | `js/chamber-rooms.js` | room assignments |
| `id="chamber-groups"` | `js/chamber-rooms.js` | chamber music |
| `id="week-snacks"` | `js/snacks.js` | home |
| `id="snack-schedule"` | `js/snacks.js` | snacks |
| `id="students-grid"` | `js/our-students.js` | our students |

## Adding a page

1. Copy the page most like it into the right folder of `html/`, matching the menu it will sit under.
   Page file names must be unique across all of `html/`, because the menu highlights the current
   page by file name.
2. Change the `<title>`, the description, the page header and the content.
3. Add a link to it in the navigation and footer of every page (see above).
4. Add its file name to the matching list in `vercel.json` so it gets a short address (see below).

## Short page addresses (Vercel only)

On Vercel, pages are reached at short addresses such as `/about`, `/calendar` or `/admin` instead of
their file paths. Two lists in `vercel.json` do this:

- **rewrites** serve a short address from the real file, one list per folder, e.g.
  `"/:page(calendar|chamber-rooms|snacks|signup)"` serves `/snacks` from `html/participate/snacks.html`.
  A new page needs its file name added to its folder's list.
- **redirects** send any address ending in `.html` (or starting with `/html/`) to the short form.
  That is how the ordinary relative links in the HTML end up at the short addresses, and why the
  links in the pages never need to change.

This is also why a page's file name is its address, and why names must be unique across `html/`.
GitHub Pages cannot do any of this, so there the full file paths are used.

## Styles

All public styles are in `css/site.css`, in labelled sections (`/* ---------- Calendar ---------- */`
and so on). Colours and type sizes are variables at the top of the file. Rules near the end of the
file deliberately refine earlier ones, so add new rules to the section they belong to rather than
the very top.

## Publishing changes

Commit and push. GitHub Pages serves the `prototype` branch and Vercel the `main` branch (see the
README). Changes to the Google Sheet need no push at all.
