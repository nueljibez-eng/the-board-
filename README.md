# THE BOARD — AI version

This version connects the existing chat interface to Cloudflare Workers AI.

## Files
- `index.html` — website interface
- `worker.js` — secure server-side AI endpoint
- `wrangler.jsonc` — Cloudflare Worker + AI binding
- `.assetsignore` — prevents server files from being publicly served

## GitHub layout
Keep all four files in the repository root.

## Cloudflare
The Worker uses a Workers AI binding named `AI` and serves the static site from the repository root.
The `/api/*` route is handled by `worker.js`.

After committing the files, Cloudflare should redeploy the project automatically if GitHub integration is enabled.
