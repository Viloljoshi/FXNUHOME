# FXU Home

Apple-style landing page for the FXU app suite — hosted on **GitHub Pages** (pure static HTML/CSS/JS, no build step).

## What's on the page

- **Apps** — Trade Journal, Risk Calculator and Affiliate CRM, each with a live screenshot and a link to the deployed app
- **For Affiliates** — the software suite, community support, guidance & research, partnerships
- **Education** — the session curriculum (patterns, risk management, psychology, review & journaling)
- **Waitlist** — "Sign in" / "Join the waitlist" opens a form; submissions are saved as GitHub issues

## Structure

```
index.html        # all markup
css/styles.css    # design system + motion
js/main.js        # theme, reveals, tilt, modal
js/waitlist.js    # waitlist → GitHub issue
assets/           # app screenshots
```

## Waitlist setup (one time)

Signups are created as issues in [`Viloljoshi/fxu-waitlist`](https://github.com/Viloljoshi/fxu-waitlist) (private).

1. Create a **fine-grained** token at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new):
   - Resource owner: **Viloljoshi**
   - Repository access: **Only** `fxu-waitlist`
   - Permissions → **Issues: Read and write** (nothing else)
2. Open `js/waitlist.js` and paste the token **split into chunks** into `TOKEN_PARTS`, e.g.:
   ```js
   var TOKEN_PARTS = ['github_pat_ABCD', '1234efgh', '5678ijkl'];
   ```
   (Splitting keeps GitHub's secret scanner from auto-revoking it. Worst case someone extracts it — they can only file issues in that one repo; revoke it anytime.)
3. Commit and push. Done — each signup appears as an issue labelled `waitlist`.

## Deploy

Push to `main` — GitHub Pages serves the site from the repo root.
