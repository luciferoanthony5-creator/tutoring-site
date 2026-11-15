# Tutoring site

Plain static site (HTML, CSS, JS, PDFs) for physics lessons, hosted on GitHub Pages
(repo `luciferoanthony5-creator/tutoring-site`, branch `main`, root folder). No frameworks, no backend.
One small build step: `python3 scripts/build.py` turns the lesson data in `content/` into lesson pages
(GitHub runs it after every push; run it yourself before testing locally). The site name `AntsPhysicsLessons` is a placeholder.

Read `claude/website-plan.md` before larger changes; `claude/progress-log.md` has history.

## Structure
- `index.html`, `about.html`, `privacy.html`, `404.html`
- `electricity-magnetism/index.html` (subject page), `unit-N/` with `index.html` overview,
  `N-M-topic.html` lessons, and `N-M-worksheet.pdf` / `N-M-solutions.pdf`
- `content/` is the source for lessons: `site.json` (name, address), `subjects.json` (subjects and units), `lessons/*.json` (one per lesson). `templates/lesson.html` is the lesson page; `scripts/build.py` writes the lesson `.html` files, `assets/lessons.js` and `sitemap.xml` from them. Those three outputs are GENERATED: never edit them by hand.
- `.pages.yml` = the forms shown in the Pages CMS editor (app.pagescms.org), where invited tutors add lessons without the code; uploads land in `files/`. `.github/workflows/build.yml` rebuilds and publishes.
- `assets/style.css`, `assets/nav.js` (menu, unit list, unit outline, breadcrumb, prev/next, link preloading), `assets/demos.js` (all physics demos), `assets/lessons.js` (generated list of lessons)
- `mechanics/index.html` (subject page; no units yet, so `units: []` in `lessons.js`)
- `assets/video/` (home background: `home-loop.webm`, `home-loop.mp4`, `home-loop-poster.jpg`) and `manim-sources/` (`scene.py` draws it, `render.py` rebuilds it: `python3 manim-sources/render.py`, needs manim + ffmpeg)
- `latex-sources/` with `make_pdfs.py` to rebuild placeholder PDFs (`python3 latex-sources/make_pdfs.py`, needs pdflatex)

## Adding a lesson
In the Pages CMS editor: Lessons > Add, fill the form, Save. By hand: copy a file in `content/lessons/`
(named `<subject>-<lesson-slug>.json`), edit it, put PDFs in `files/`, run `python3 scripts/build.py`.
Adding a unit: add it to `content/subjects.json`. Adding a subject: also make `<subject>/index.html` by hand
and add the subject to the `subject` select in `.pages.yml`. To change every lesson page, edit `templates/lesson.html`.

## Style decisions
"Field Lines, drawn live" (built with `frontend-design`, replaced the old Plex/blue style A):
Newsreader serif for reading and headings, Familjen Grotesk for menus and labels, deep indigo ink
#1B1F4B on near-white paper #FAFAFC, dark mode follows system setting. Red (#E4572E) means positive
charge and blue (#2B59FF) means negative charge; use them only where they carry that meaning
(logo dots, worksheet = red tag, answer key = blue tag, the demos). Demos live in `assets/demos.js`
and a page picks one with `<canvas data-demo="field|projectile">`: the E&M page has the
interactive field demo and the Mechanics page the interactive projectile launcher (mouse/touch only).
The home page is different: true black (tokens overridden on `body.home`, home only; `body.home` must stay
transparent or it hides the video) with the quote as the `<h1>` and a full-screen manim video loop behind the text
(particles entering a magnetic field, every third a half circle, cross-fading with a swinging pendulum in neutral
white; a paper-coloured scrim fades the left so text stays readable; pauses on a hidden tab; only the poster still
under reduced motion). On load the quote fades in word by word, then the paragraph (starts 3/4 through the quote)
and subject rows; logo dots pulse slowly. Menu dropdowns fade and drop in and Esc closes them (all pages).
Lesson pages get a sticky unit outline and a Subject / Unit breadcrumb built by `nav.js`.
Clicks: pages cross-fade (`@view-transition`, header held still), links are preloaded on hover (speculation rules,
prefetch fallback), and every row tints on press.
Units are native `<details>` and start expanded. Answer keys are posted openly. One real HTML file
per lesson. Don't restyle existing pages without being asked.

## Working with me
- I'm new to HTML/CSS/JS: put a short comment beside each line explaining the syntax.
- Test locally with `python3 scripts/build.py` then `python3 -m http.server 8000` (YouTube fails from `file://`).
- Commit with a clear message; I push. Custom-domain steps are in the README.

## Design tools
- The site's chosen style (see Style decisions: "Field Lines, drawn live", Newsreader + Familjen Grotesk, indigo ink, red/blue charge colours) wins over any skill's default taste.
- Use only the skill I name in a request (`emil-design-eng`, `impeccable`, `design-taste-frontend`, or `frontend-design`). Don't combine them unless I ask. (The Taste skill's repo name is `design-taste-frontend`, not `-v1`.)
- Use Playwright to check pages at http://localhost:8000 (start `python3 -m http.server 8000` first) at desktop (1280px) and phone (390px) widths.
- Use Figma only when I give you a Figma link.

# Finishing work
Please avoid stopping while you still owe work the user asked for. Be persistent and do not stop unless needed.

While status notes are welcome, as is clarifying with the user on open decisions, carry on with work that does not depend on the user's answer without unnecessary stops.

If you notice yourself inviting the user to redirect you or offering to wait, instead proceed on the next part of the task. You may meet ordinary obstacles like errors, timeouts, locked files, empty results or failing tools. Diagnose them first, and when they are not real blockers, work through them with the access you have (wait and retry, fix the request, use another tool or source) rather than stopping unnecessarily.

If someone clearly decided something is a hard blocker, such as a file marked not to be touched, access that was intentionally withheld, or a safety guardrail, leave it alone, say plainly what you found, and look for another safe way to finish the task. Stopping before the task is complete is very rarely merited, as in when the task can't move forward without user input, or where the blocker is deliberate and should not be worked past. This does not override the need for confirmation on risky or destructive actions.
