# MENU-001 (plan v1, from Astra Planner, owner task: make the subject-page dropdown menus smooth)

Goal: smooth the subject pages' expandable unit lists and the shared header dropdowns / phone menu.
Design skill: `emil-design-eng` only. Keep Field Lines typography, colours, layout, demos, content.

| Before | After | Why |
| --- | --- | --- |
| Units rely on newer native sizing transitions | Verified smooth open/close, with fallback if necessary | Prevent snapping |
| Rapid toggles interrupt transitions | Reverse from current rendered state | Latest action wins |
| Phone menu closes instantly; labels use nowrap | Smooth close and wrapped long links | Usable motion and navigation |

Files: claude/plans/MENU-001.md (this), assets/style.css, assets/nav.js, claude/progress-log.md.

style.css: 180-240ms ease-out open, shorter close; sync unit chevrons; no clipped links/focus rings;
scope unit changes to .unit (keep .outline); header motion = opacity + small transform, fly-outs reachable
without flicker; wrap long phone-menu labels, no horizontal overflow at 390px; reduced motion removes
height/translate/rotate; keyboard-initiated changes immediate.

nav.js: only what is needed after reproducing. Prefer native CSS; if tested browsers can't animate details,
use a small feature-detected measured-height fallback (WAAPI/CSS, no library): reverse from current geometry,
cancel stale completions, clear temporary heights, handle resize; keep details/summary semantics; bulk and
single toggles agree; keep overview links and initial expanded state; aria-expanded correct; Escape closes
the phone menu from button or contents and restores focus; closed menu keeps no focus.

Acceptance: smooth pointer/touch open and close; rapid reversal / repeated toggles / Expand-Collapse all end
correctly; keyboard Enter/Space, links, focus visibility, Escape, aria-expanded work; reduced motion removes
spatial motion; Mechanics, home entrance/video, lesson outline/prev-next unchanged; no overflow or clipped
labels at 390px.

Validation: python3 -m http.server 8000; Playwright 1280/390, light/dark, normal/reduced motion; unit and bulk
toggles; subject>unit>lesson traversal; phone touch menu; rapid toggles; keyboard only; Escape from button and
contents; resize while open; Mechanics + home + one lesson smoke test; before/after + intermediate frames;
console errors; git diff --check. Report IMPLEMENTED MENU-001 v1.

## Review round 1 (Astra Planner): CHANGES REQUESTED on commit 63dc937

Kept as-is: the leftward-opening lessons fly-out (in scope; it makes the planned traversal usable).

| Finding | Required outcome | Fix |
| --- | --- | --- |
| R1 (P2): phone overrides kept `width:max-content; max-width:380px` on nested lists, so at 390px scrollWidth 408 vs clientWidth 390 and "2.1 Fields of Continuous Charge Distributions" ran past the panel edge (clipped by `overflow-x:hidden`) | Nested lists and full label text fit the indented content width; check text/element bounds, not only overflow | Phone block now resets `width:auto; max-width:none` on nested lists (`style.css`). |
| R2 (P2): desktop `:focus-within` used the pointer fade/slide (and 80 ms close grace); `skipMotion` only covered clicks | Keyboard opening/closing of both levels immediate; pointer motion kept | `.menu li:has(:focus-visible) > ul { transition: none !important }` (keyboard focus opens at once; a mouse click does not match `:focus-visible`). `nav.js`: Esc and Tab-from-inside call `skipMotion(menu)`; `.menu.instant ul` now also switches off the fly-outs' transitions. |

### Results after the fixes (Chromium 150, Playwright, cache bypassed)
- R1, phone menu text/element/list bounds vs the panel's content edge, long Unit 2 titles: 390 px and 360 px pass in all 8 combinations of loaded fonts / blocked Google Fonts (fallback fonts) x light / dark x normal / reduced motion (scrollWidth = clientWidth; worst text right edge 330 vs content edge 363 at 390 px loaded; 321 fallback). Screenshot: `.playwright-mcp/menu001-r1-phone-fallback-fonts.png`.
- 320 px (beyond the 390 px acceptance): the header row itself overflows by 30 px, identically at HEAD (brand + Menu button wider than the bar), which shifts the panel; not caused by this task and not fixed here.
- R2, real Tab/Shift+Tab/Esc with the pointer parked outside the header: Tab onto E&M, onto the unit, onto lessons: 0 partially visible frames (no opacity or translate in between); Esc: both levels hidden on the first frame after the key, 0 transient frames; Tab from the last lesson to Mechanics (17 presses from the page start): both levels hidden within one frame; Shift+Tab back to E&M opens at once. Pointer behaviour unchanged: opening 16 partial frames, closing still fully visible at 60 ms (80 ms grace) then fades.
- Regression: units native and forced fallback (close 264->73 / open 73->264 with 15-18 distinct heights, reversal min 75 ends 264, bulk 264/265 with no inline style, keyboard Enter single step); phone menu (15 / 11 opacity steps, Esc from button and from inside, keyboard Enter instant, resize resets); pointer click-through lands on 1-1-coulombs-law.html; 24 page/width/scheme combinations OK. One headless-Chrome console message ("Permissions policy violation: compute-pressure"), not from page code.
