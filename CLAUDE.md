# Tutoring site

Plain static site (HTML, CSS, JS, PDFs) for physics lessons, hosted on GitHub Pages
(repo `luciferoanthony5-creator/tutoring-site`, branch `main`, root folder). No build step,
no frameworks, no backend. The site name `AntsPhysicsLessons` is a placeholder.

Read `claude/website-plan.md` before larger changes; `claude/progress-log.md` has history.

## Structure
- `index.html`, `about.html`, `privacy.html`, `404.html`
- `electricity-magnetism/index.html` (subject page), `unit-N/` with `index.html` overview,
  `N-M-topic.html` lessons, and `N-M-worksheet.pdf` / `N-M-solutions.pdf`
- `assets/style.css`, `assets/nav.js` (menu, unit list, prev/next), `assets/lessons.js` (the one list of lessons)
- `latex-sources/` with `make_pdfs.py` to rebuild placeholder PDFs (`python3 latex-sources/make_pdfs.py`, needs pdflatex)

## Adding a lesson
Copy an existing lesson file; change `<title>`, meta description, `<h1>`, blurb, the YouTube ID
after `/embed/`, the PDF links and `data-lesson` on `<body>`; put PDFs beside it; add one line to
that unit's `lessons` list in `assets/lessons.js`. Adding a unit: new `unit-N` folder with an
`index.html` plus a unit block in `lessons.js`.

## Style decisions
Style A "Field Lines": IBM Plex Serif headings, IBM Plex Sans body, blue accent #1F5FD1, cool
light-grey paper, dark mode follows system setting. Units are native `<details>` and start
expanded. Answer keys are posted openly. One real HTML file per lesson. Don't restyle existing
pages without being asked.

## Working with me
- I'm new to HTML/CSS/JS: put a short comment beside each line explaining the syntax.
- Test locally with `python3 -m http.server 8000` (YouTube fails from `file://`).
- Commit with a clear message; I push. Custom-domain steps are in the README.
