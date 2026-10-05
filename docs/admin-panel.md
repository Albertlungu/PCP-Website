# Admin panel

The admin panel manages the profiles on the Our Students page. It is at `html/admin/` on the live
site: https://uottawa-pcp.vercel.app/admin on Vercel, or
https://albertlungu.github.io/PCP-Website/html/admin/ on GitHub Pages.

## How it works

- Published profiles live in `data/students.json`. Photos live in `images/students/`.
- The Our Students page reads `data/students.json`, so every visitor sees the same published list.
- The admin panel loads the same file, so it starts from the live data in any browser.
- Edits are kept in your browser as a draft until you click **Publish**. Nothing changes on the live
  site before that.
- **Publish** sends the list to `api/save-students.js`, a small server function that only runs on
  **Vercel**. It checks the password, then commits the JSON file and any new photos to GitHub in a
  single commit, and Vercel redeploys within about two minutes. On GitHub Pages there is no server,
  so you can sign in, edit and preview there, but Publish will fail.

## The password

The sign-in screen compares what you type with `ADMIN_PASSWORD` near the top of
`js/admin-students.js`. Because this check runs in the browser, the password is visible to anyone who
reads the page's source; it keeps casual visitors out, nothing more.

The publish function checks the password again on the server, against the Vercel environment
variable `ADMIN_PASSWORD`, or the same default as the JavaScript when that variable is not set. If you
change the password, change it in `js/admin-students.js` and in Vercel so the two match.

## One-time setup (Vercel)

Publishing needs a GitHub token. In the Vercel project, open **Settings > Environment Variables** and
add:

| Name | Value |
| --- | --- |
| `GITHUB_TOKEN` | A fine-grained GitHub token (see below). Required to publish. |
| `ADMIN_PASSWORD` | Optional. Overrides the default password on the server (see above). |

Optional: `GITHUB_OWNER` (default `Albertlungu`), `GITHUB_REPO` (default `PCP-Website`),
`GITHUB_BRANCH` (default `main`).

Redeploy after adding or changing variables.

### Creating the GitHub token

1. GitHub > Settings > Developer settings > Personal access tokens > **Fine-grained tokens** > Generate new token.
2. Repository access: **Only select repositories** > `PCP-Website`.
3. Repository permissions: **Contents: Read and write**. Nothing else is needed.
4. Set an expiration, and put a reminder in your calendar to renew it.

## Using the panel

1. Open the admin page and sign in.
2. **Add New Student**: choose a photo, paste one (Cmd+V / Ctrl+V), or drag it onto the photo box.
   Photos are resized automatically.
3. Use the arrows on a card to change the order, and **Edit** or **Delete** to change a profile.
4. **Undo**, **Redo**, and **History** cover the changes made since the panel was opened.
5. **Preview** opens the Our Students page showing your unpublished draft.
6. **Publish** puts the draft live. **Discard unpublished changes** goes back to the live version.

## Troubleshooting

- **"Incorrect password"** on sign-in: compare with `ADMIN_PASSWORD` in `js/admin-students.js`.
- **"Incorrect password"** on publish: the Vercel `ADMIN_PASSWORD` variable differs from the one in
  `js/admin-students.js`.
- **"Server is not configured"**: `GITHUB_TOKEN` is missing in Vercel.
- **Publish fails with HTTP 405 or 404**: you are on GitHub Pages, which cannot publish. Use the Vercel site.
- **"GitHub API error (401/403)"**: the token expired or lacks Contents write access to this repository.
- **"The site was updated by someone else"**: someone published or pushed in the meantime. Reload
  the panel; your draft is kept.
