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
