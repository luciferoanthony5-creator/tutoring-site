# Session notes: 2026-10-25 (front-end rewrite and demos)

Final state: pushed to `main` at `baebdc7`. Working tree clean. Live site: https://luciferoanthony5-creator.github.io/tutoring-site/

## What was done, in order

1. **Setup check.** Confirmed the Debian move and design-tool setup were done (CLAUDE.md, `claude/` plan and log, skills, MCP tools). No saved "test prompt" exists in the repo.
2. **Prompt writing.** Drafted the rewrite prompt. Decisions: use one design skill at a time (they conflict on fonts, palette and motion), drop `impeccable`, ignore the old "Field Lines" style for this rewrite. `frontend-design` was uninstalled then reinstalled; it stays installed and listed in CLAUDE.md.
3. **Front-end rewrite** (`frontend-design`), commit `d524464`. New look "Field Lines, drawn live": Newsreader (reading and headings) + Familjen Grotesk (menus, labels), indigo ink `#1B1F4B` on paper `#FAFAFC`, red `#E4572E` = positive charge, blue `#2B59FF` = negative charge, used only where they carry that meaning. Added a sticky unit outline on lesson pages, a skip link, an inline favicon, and fixed the empty ad-slot box showing.
4. **Polish and motion pass** (`emil-design-eng`), commit `b47a2d6`. Mouse-only hover, press feedback on buttons, sliding `<details>` dropdowns, phone menu fade, charge press and flip animation, gentler reduced-motion rules.
5. **Field demo symmetry fix**, commit `90b3415`. Lines now start from both charges (a line from the negative charge that lands on the positive is skipped, since it repeats one already drawn).
6. **Mechanics page, demos on subject pages, home background**, commit `16ec522`. New `assets/demos.js` (replaces `field.js`) with scenes chosen by `<canvas data-demo="field|projectile|background">`.
7. **Flicker, ghost ball, magnetic scene, motion polish**, commit `67d3c10`.
8. **Half-circle charge**, commit `baebdc7`, then pushed. The user confirmed the flicker is gone.

## Decisions made by the user

- Projectile demo: press and drag to aim, **release to launch**. No Launch button, no peak or landing marks, no readout line, **no keyboard controls** (so it is mouse/touch only). The grey ghost ball was later removed too.
- Home page: the demo is non-interactive, full-screen background, looping through scenes (field, projectile, magnetic field). The interactive field demo lives on the E&M page.
- Mechanics is a real subject page now, with no units yet (`units: []`).
- Push only when the user says so; the user tests locally first.
- Only one design skill per task, named by the user. `frontend-design` stays listed.

## Site structure after this session

- `index.html`: text on the left over a fixed full-screen canvas (`.bg-demo`), a paper-coloured fade behind the text, solid footer.
- `electricity-magnetism/index.html`: interactive field demo above the unit list.
- `mechanics/index.html`: interactive projectile launcher, note that lessons are on the way.
- `assets/demos.js`: field scene, projectile scene (play and ambient modes), magnetic-field scene (background only), three hosts.
- `assets/nav.js`: also builds the unit outline; copes with a subject that has no units.
- `assets/style.css`: tokens (`--ease-out`, colours), `.demo`, `.bg-demo`, `body.home::before` veil, polish and reduced-motion blocks at the end.
- `sitemap.xml` includes the Mechanics page.

## How it works (the non-obvious parts)

- Home loop: field 12 s, projectile 12 s, magnetic 12 s, 1.2 s eased crossfade, drawn at about 30 fps, pixel density capped at 2, paused on a hidden tab, one still frame under reduced motion.
- Magnetic scene: charge turns at a fixed rate (radius = speed / rate), positive bends up, negative bends down. Every third charge is sized to make a complete half circle inside the band and on screen.
- Frame limiter threshold is 28 ms, not 33. At 33 ms a 60 Hz screen jitters between 33 and 50 ms, which looked like flicker. Measured after the fix: 89 of 90 updates exactly 32 ms apart.
- Alpha is saved and restored (never multiplied then divided) so a zero alpha cannot break later drawing.
- Text stays readable over the animation: worst measured contrast 4.99:1 to 5.24:1 across scenes, light and dark, desktop and phone (needs 4.5:1).

## Checks run

All 15 pages at 1280px and 390px, light and dark: no console errors, no horizontal scroll, no broken links or PDFs. Hidden-tab pause and reduced-motion still frame verified. Known and harmless: `404.html` errors on localhost because it uses `/tutoring-site/` paths (works on GitHub Pages); YouTube iframes log a "compute-pressure" permissions warning.

## Gotchas learned

- Do not run `pkill -f "http.server 8000"` from the Bash tool: the pattern matches the shell running it and kills the command. Leave the server running or stop it from your own terminal.
- `.ad-slot` needed `[hidden] { display: none; }` because `display: grid` was overriding the `hidden` attribute.
- `.playwright-mcp/` is in `.gitignore` (screenshots and logs from Playwright checks).

## Still open

- Lesson videos are placeholders (`VIDEO_ID_11/12/13/21/22/23`), so those video boxes are black. Unit overview videos are real.
- Test the projectile launcher and the field demo's double-tap on a real phone (only a simulated mouse was used).
- The projectile launcher has no keyboard control; revisit if that matters for visitors.
- Real worksheets and solutions, site name and domain decision, privacy page before AdSense (from the earlier plan).
- Old Windows clones to delete, and the "Website" Claude project should get the updated `claude/` copies.
- 404/sitemap/robots use the github.io address and need to change when a custom domain goes live (README has the steps).
- Possible later `emil-design-eng` pass on any further motion.
