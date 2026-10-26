# Progress log

## 2026-09-17 — Phase 1 prototype (artifact)

- Artifact: https://claude.ai/artifact/3Bem9F3g6BYpfraeeunVhF (v3). Single-file prototype with a style switcher.
- Decisions: **style A "Field Lines"** (IBM Plex Serif + IBM Plex Sans, blue accent), **units start expanded**.

## 2026-09-17 — Phase 2: site is LIVE on GitHub Pages

- Repo: https://github.com/luciferoanthony5-creator/tutoring-site (branch main, Pages = deploy from branch, root).
- Live: https://luciferoanthony5-creator.github.io/tutoring-site/
- Local clone (GitHub Desktop): `C:\Users\lucif\Documents\GitHub\tutoring-site` on Windows machine "rogzephyrus". Claude has folder access to `C:\Users\lucif\Documents` and writes files straight into the clone; Anthony commits + pushes in GitHub Desktop. (Claude cannot delete files on the PC; Anthony deletes in Explorer/VS Code.)
- Anthony's first upload put the site in a `physics-site/` sub-folder; Claude then wrote the whole site at the repo root. Anthony to delete the `physics-site` sub-folder, then commit "move site to root" and push.
- 404.html uses absolute `/tutoring-site/` paths; sitemap.xml and robots.txt use the github.io address. All three must change when the custom domain goes live (README says how).
- Older copy at `C:\Users\lucif\Documents\physics-site` is now stale; the clone is the source of truth.

## Site structure (as planned)

`index.html`, `about.html`, `privacy.html`, `404.html`, `assets/style.css`, `assets/lessons.js` (the one list), `assets/nav.js` (menu, unit list, prev/next), `electricity-magnetism/index.html`, `electricity-magnetism/unit-1/` and `unit-2/` (index.html overview + one .html per lesson + PDFs), `sitemap.xml`, `robots.txt`, `.nojekyll`, `README.md`, `latex-sources/`.

## Content status

- Real videos: Unit 1 overview tGxjP2O5Klo, Unit 2 overview _8kwgPlmyuU. Lesson videos VIDEO_ID_11/12/13/21/22/23 are placeholders.
- Unit 1 "Electric Charge, Force, and Field": 1.1, 1.2, 1.3, Review. Unit 2 "Gauss's Law": 2.1, 2.2, 2.3, Review.
- PDFs are LaTeX placeholders (2–3 real problems each); sources + make_pdfs.py in `latex-sources/`.

## Next

- Real lesson videos and worksheets; site name/domain decision; privacy page before AdSense.

## 2026-10-25 — Moved to Debian

- Editing now happens on Debian 13 with Claude Code in `~/dev/tutoring-site`; commit and push with git or VS Code. Claude can now delete and rename files too.
- Plan and progress log now live in the repo under `claude/`. Section 12 of the plan describes the new workflow.
- Added `CLAUDE.md`. Verified locally: pages and PDFs serve (200) and `make_pdfs.py` builds all PDFs with pdflatex.
- Left for Anthony: install the frontend-design plugin, delete the old Windows clones, update the "Website" Claude project with these copies.

## 2026-10-25 — Front-end rewrite ("Field Lines, drawn live")

- Rebuilt the look with the `frontend-design` skill only. New fonts (Newsreader, Familjen Grotesk), indigo/near-white palette, red = positive charge, blue = negative charge. Old Plex/blue style A is gone.
- New: `assets/field.js` (draggable field-line demo on the home page), sticky unit outline on lesson pages (built in `nav.js`), skip link, inline favicon (fixes the `favicon.ico` 404). Removed the all-caps eyebrow labels and the subject cards.
- Fixed the empty ad-slot box showing even though it has `hidden`.
- Checked all 15 pages at 1280px and 390px, light and dark: no horizontal scroll, no broken PDF links. `404.html` only works on GitHub Pages (absolute `/tutoring-site/` paths), so it errors on localhost as before.
- `.playwright-mcp/` added to `.gitignore`.
