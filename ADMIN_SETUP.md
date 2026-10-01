# Admin Panel

The admin panel at `/admin` manages the profiles on the Our Students page.

## How it works

- Published profiles live in `data/students.json`. Photos live in `images/students/`.
- The Our Students page reads `data/students.json` directly, so every visitor sees the same published list.
- The admin panel loads the same file, so it starts from the live data in any browser.
- Edits are kept in your browser as a draft until you click **Publish**. Nothing changes on the live site before that.
- **Publish** calls `/api/save-students` (a Vercel function). It checks the password, then commits the JSON file and any new photos to GitHub in a single commit. Vercel redeploys within about two minutes.

## One-time setup (Vercel)

In the Vercel project, open **Settings > Environment Variables** and add:

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | The password editors type to sign in. Pick a new one; the old client-side passwords were visible in the site's source code. |
| `GITHUB_TOKEN` | A fine-grained GitHub token (see below). |

Optional: `GITHUB_OWNER` (default `Albertlungu`), `GITHUB_REPO` (default `PCP-Website`), `GITHUB_BRANCH` (default `main`).

Redeploy after adding or changing variables.

### Creating the GitHub token

1. GitHub > Settings > Developer settings > Personal access tokens > **Fine-grained tokens** > Generate new token.
2. Repository access: **Only select repositories** > `PCP-Website`.
3. Repository permissions: **Contents: Read and write**. Nothing else is needed.
4. Set an expiration, and put a reminder in your calendar to renew it.

If an older classic token with full `repo` scope exists, revoke it after the new one works.

## Using the panel

1. Go to `https://<your-site>/admin` and sign in.
2. **Add New Student**: choose a photo, paste one (Cmd+V / Ctrl+V), or drag it onto the photo box. Photos are resized automatically.
3. Use the arrows on a card to change the order, and **Edit** or **Delete** to change a profile.
4. **Undo**, **Redo**, and **History** cover the changes made since the panel was opened.
5. **Preview** opens the Our Students page showing your unpublished draft.
6. **Publish** puts the draft live. **Discard unpublished changes** goes back to the live version.

## Troubleshooting

- **"Server is not configured"**: `ADMIN_PASSWORD` or `GITHUB_TOKEN` is missing in Vercel.
- **"Incorrect password"**: check `ADMIN_PASSWORD` in Vercel. Changes there need a redeploy.
- **"GitHub API error (401/403)"**: the token expired or lacks Contents write access to this repository.
- **"The site was updated by someone else"**: someone published or pushed in the meantime. Reload the panel; your draft is kept.
- **Sign-in says it cannot reach the server**: the panel needs the deployed site (or `vercel dev`) because publishing runs as a Vercel function. Opening the files directly or with a plain static server will not work.
