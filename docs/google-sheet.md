# The Google Sheet

Almost everything that changes during the year is kept in one Google Sheet, not in this repository:

https://docs.google.com/spreadsheets/d/1GSVqiWOL4mZTVuTaTuaskvX7zCzQrhJ7zL1Pvzl3F68/

The website reads the sheet every time someone opens a page, so an edit to the sheet shows up on the
site straight away. There is nothing to deploy.

The sheet ID, the API key, and the tab names are set in `js/shared/config.js`. If a tab is renamed,
change its name there too.

## How the site reads it

- **Reading** uses the Google Sheets API with a public, read-only API key (Google Cloud project
  `pcp-website-475812`). This only works while the sheet is shared as "Anyone with the link can
  view". If every sheet-based section of the site says it "could not be loaded", check that first.
- **Writing** (performance sign-ups) goes through a Google Apps Script web app, described at the
  end of this page.

The site is fussy about layout but forgiving about formatting. In particular, dates can be typed as
`Sept 12`, `Sept. 12`, `Oct 3`, `08-Nov` or `10/3/2026`. Dates without a year are placed in the
school year that contains today (August to July).

## Tab: Performances

Used by the calendar, the "Coming up" panel on the home page, the Schedule, Masterclasses and
Performance class pages, and the sign-up form.

- Row 1 is a title that includes the school year, e.g. `uOttawa PCP 2026-27 Performance Class/Master Class Schedule`.
  The site reads the year from it.
- Row 2 is the column headers.
- Columns: **A** Date, **B** Guest artist, **C** Remarks, **D** Student name, **E** Instrument,
  **F** Piece, **G** Duration (minutes, like `10`, or `12' 30''`).
- One row per performer. Only the first row of a date needs the date; the rows under it with an
  empty column A belong to the same date.
- **Remarks** decides the kind of event: anything containing "masterclass" is a masterclass,
  "performance class" is a performance class, anything else (e.g. "Happy Thanksgiving (No Classes)")
  is shown as a special day. A row with a guest artist and no remarks counts as a masterclass.
- A row under a date with an empty student name is an **open slot** that the sign-up form offers.
  `N/A` in the student name means "no performers that day", not a free slot.
- A date with nothing in it at all is treated as a placeholder and not shown.

## Tab: Chamber Rooms

Used by the room assignments page, the "Chamber rooms" panel on the home page, and the group list
on the Chamber music page.

- A row with `Coach` in column B, followed by a row with each group's coach (columns B onward).
- A row with `Groups` in column A and each group's members in columns B onward, separated by `/`.
- Then one row per Saturday: the date in column A and each group's room number in the same column
  as that group.
- A Saturday without chamber coaching has text instead of a room number in column B, e.g.
  `Thanksgiving`. The site shows that text instead of rooms.

Each group keeps the same colour all year, assigned by column order.

## Tab: Snacks

Used by the Snacks page and the "Snacks" panel on the home page.

- Row 1 is a title, row 2 the headers: **A** Week, **B** Date, **C** Parent name, **D** Student name.
- One row per Saturday. Week is a number on a normal Saturday.
- A Saturday without classes has a word instead of a number in Week, e.g. `Thanksgiving` or
  `No Classes`. The site shows it as "Thanksgiving: no classes".
- Rows without a date (e.g. `Winter Break`) are ignored.

## Sign-ups: the Google Apps Script

The sign-up form cannot write to the sheet with the API key, so it talks to a small Google Apps
Script web app instead. Its source code is kept in `google-apps-script/signup-backend.js` for
reference, but the copy that actually runs lives in the Google account that deployed it (open
https://script.google.com while signed in to that account). Editing the file here changes nothing on
its own.

It does three things: lists dates that still have open slots, fills the first open slot for the date
someone picks, and emails them a confirmation.

**After changing the script**, paste the file into the script editor and redeploy it as a new
version of the same deployment: Deploy > Manage deployments > (pencil icon) > Version: New version,
with "Execute as: Me" and "Who has access: Anyone". Doing it this way keeps the same URL.

If you create a brand new deployment instead, its URL changes: put the new URL in `SCRIPT_URL` at the
top of `js/signup.js`.

If the sign-up page says sign-ups are "temporarily unavailable", the web app is not publicly
reachable. Almost always the fix is to redeploy it with "Who has access: Anyone".

## New year checklist

1. Prepare the three tabs for the new year in the same layouts as above (copying last year's tabs
   and replacing the contents is easiest). Keep the tab names, or update them in `js/shared/config.js`.
2. Update the title in row 1 of Performances to the new school year.
3. Check that the sheet is still shared as "Anyone with the link can view".
4. Open the sign-up page and check that the new dates are offered.
5. Update the copyright year in the footer of every page (search the repository for `&copy;`).
