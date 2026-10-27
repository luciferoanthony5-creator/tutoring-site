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

## 2026-10-25 — Polish and motion pass (`emil-design-eng`)

- Hover effects now only apply on devices with a mouse (`@media (hover: hover) and (pointer: fine)`), so taps on phones don't leave them stuck.
- Buttons shrink to 97% while pressed. Unit lists and the lesson outline slide open and shut (`::details-content`, falls back to instant in older browsers). The phone menu fades and drops in 6px.
- Home demo: charges swell while held and pop when flipped; the intro reveal stops if you grab a charge mid-reveal (was a bug). Keyboard actions stay instant.
- Reduced motion now removes sliding, rotating and the press shrink but keeps colour fades.
- Demo fix: field lines now start from both charges (lines from a negative charge that would just repeat one from the positive are skipped), so the dipole is symmetric instead of bare on the negative side.

## 2026-10-25 — Mechanics page, demos on subject pages, home background loop (`frontend-design`)

- New `assets/demos.js` replaces `field.js`: a field scene, a projectile scene, and three hosts chosen by `<canvas data-demo="...">` (`field`, `projectile`, `background`).
- New `mechanics/index.html` with an interactive projectile launcher (press and drag to aim, release to launch; red ball with gravity, grey dashed ghost ball without; dots every 0.25 s). Anthony chose no Launch button, no peak/landing marks or readouts, and no keyboard controls, so the launcher is mouse/touch only.
- Mechanics added to `lessons.js` with `units: []`; `nav.js` now copes with a subject that has no units. Added to the home page (real link, no more "Coming later") and `sitemap.xml`.
- E&M page now has the interactive field demo above the unit list.
- Home page: the two-column hero is gone. A fixed full-screen canvas loops field scene (12 s) and projectile scene (12 s) with a 1.2 s crossfade, ~30 fps, pixel density capped at 2, paused on a hidden tab, one still frame under reduced motion. Worst measured text contrast over the animation: 4.99:1 (needs 4.5).
- Checked all 15 pages at 1280px and 390px in light and dark: no console errors, no horizontal scroll, no broken links.

## 2026-10-25 — Flicker fix, ghost ball removed, magnetic-field scene, `emil-design-eng` pass

- Removed the grey ghost ball from the projectile demo (caption and aria-label updated).
- Home background flicker: could not reproduce blank frames (canvas brightness changed smoothly), but fixed the likely causes: the 30 fps throttle used a 33 ms threshold that jittered between 33 and 50 ms on a 60 Hz screen (now 28 ms; measured 89 of 90 updates exactly 32 ms apart) and the alpha code multiplied then divided `globalAlpha` (now saved and restored).
- New third scene in the home loop (field 12 s, projectile 12 s, magnetic 12 s): charges fly into a band of field (x marks = into the screen); positive bends up, negative bends down, radius = speed / turning rate, small circles turn back out the left, big ones leave on the right.
- Motion polish (`emil-design-eng`): crossfade eased out instead of linear; ambient shots and charges fade in instead of popping; the launch arrow's dim/brighten now eases; crosshair cursor on the launcher (grab stays on the field demo).
- Worst text contrast over the home animation, magnetic scene included: 5.24:1 (needs 4.5). All 15 pages clean at 1280px and 390px, light and dark.
- Magnetic scene: every third charge (starting with the first) is now sized to make a complete half circle inside the band and on screen, then leave back out the left side.

## 2026-10-26 — Home page redo: black, quote, manim background, animated menu (`emil-design-eng`)

- Home page is true black (home only). `<h1>` is now the quote "Seek understanding for its own sake, and let all other ambitions be incidental." (no attribution; "Physics made easy." removed). The quote fades in word by word (150 ms start, 40 ms apart, split by `nav.js`), the paragraph starts 3/4 of the way through it, then the two subject rows; each of those fades over 900 ms. Logo dots pulse slowly on the home page.
- Background: the three-scene canvas loop is gone from the home page, replaced by a manim video (19.2 s, 1280x720, 0.22 MB mp4 / 0.26 MB webm): particles entering a magnetic field (every third a half circle) cross-fading with an exact large-angle pendulum in white. It loops exactly (particles repeat every 4.8 s, pendulum every 3.2 s). Sources in `manim-sources/`, output in `assets/video/`. `demos.js` is no longer loaded on the home page; its `background` mode is unused but still in the file.
- Menu (all pages, it is the shared header): dropdowns fade and drop 6 px (visibility + opacity instead of `display:none`), underline slides in on hover/focus, Esc closes the dropdown or phone menu.
- Reduced motion: no entrance, no pulse, video not played (poster still), dropdown fades only.
- Gotcha: the black is on `<html>` and `body.home` is transparent. If `body` paints its own background it covers the video (z-index -2).
- Gotcha: manim needs cairo/pango dev headers and ffmpeg (`sudo apt install libcairo2-dev libpango1.0-dev ffmpeg pkg-config`) plus `pip install manim`; a venv works. `render.py` needs both on PATH.
- Checked at 1280px and 390px in headless Chrome (Playwright MCP was not connected): no console errors, video plays, hidden tab pauses it, Esc closes the menu. Not checked: Safari/Firefox, the other 14 pages' header after the menu change.
- Open: the video's x marks sit behind the text on phones (readable; lowering their opacity is an option). The phone menu's long lesson names run off the right edge (already the case before this pass).

## 2026-10-27 — MENU-001 v1: smoother unit lists and header menus (`emil-design-eng`)

- Unit lists (subject pages): open 220 ms, shut 160 ms (ease-out), chevron uses the same two timings. Native `::details-content` sliding already worked in Chromium and retargets from the current height on a rapid reversal, so it stays. New in `nav.js`: a by-hand slide (Web Animations API) used only when the browser lacks `::details-content` or `interpolate-size`; it adds `.js-details` to `<html>`, keeps `open` until a closing slide ends (`.is-closing`) and reverses from the height on screen.
- Keyboard-triggered changes are instant (a click with `e.detail === 0` adds `.instant` for two frames): unit headings, Expand/Collapse all, the phone Menu button, Esc.
- Phone menu: now fades and drops in (180 ms) and out (120 ms) with `visibility` instead of `display:none`, so it animates both ways and a closed menu cannot be tabbed into. Long lesson names wrap; the panel no longer scrolls sideways. Esc now also closes it from the Menu button (it did nothing there before) and from inside; focus returns to the button. Widening the window past the phone breakpoint resets it.
- Desktop fly-outs: close after an 80 ms grace (a slip to a neighbouring item no longer flickers), 120 ms close / 180 ms open; the lessons list slides sideways from its unit.
- Fix found while testing: the lessons fly-out opened to the right, off the screen (the menu is at the right edge), and its hidden box made every page scroll sideways by about 460 px at 1280 px (also true at HEAD). It now opens to the left, is at most 380 px wide and wraps long titles; no sideways scroll at 721, 800, 900, 1280 or 1920 px.
- Focus ring on lesson links inside units moved to `outline-offset: 0` so the sliding box's clipping does not cut it.
- Reduced motion: no height slide, chevron rotation, nudges or drops; fades remain.
- Checked in Chromium 150 (Playwright) at 1280 and 390 px, light and dark, normal and reduced motion, plus 721 to 1920 px for the fly-outs: open/close/reversal/five rapid clicks/Expand-Collapse (native and forced fallback), keyboard Enter/Space, Esc, resize while open, link click-through, Mechanics/home/about/overview/lesson pages. No console errors.
- Not checked: Firefox, Safari (only Chromium is drivable here; the fallback was exercised in Chromium by forcing `CSS.supports('interpolate-size')` to false), real touch hardware (taps were simulated with mouse clicks).
- Known, unchanged: a diagonal mouse path from a unit across a neighbouring unit label switches to that unit's lessons (normal hover-menu behaviour).
- MENU-001 review round 1 (Astra): fixed R1 (phone nested lists now `width:auto; max-width:none`, so long Unit 2 titles fit inside the panel; verified by text/element bounds at 390 and 360 px, loaded and fallback fonts, light/dark, normal/reduced motion) and R2 (keyboard focus opens and closes desktop fly-outs instantly via `:has(:focus-visible)`, plus `skipMotion` on Esc and Tab; pointer motion kept). At 320 px the header row overflows by 30 px, same as before this task (not fixed). Details in `claude/plans/MENU-001.md`.
