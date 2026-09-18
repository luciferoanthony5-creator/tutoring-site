# AntsPhysicsLessons (placeholder name)

Free physics video lessons and worksheets. A plain static site: HTML, CSS, one
small JavaScript file, and PDFs. No build step, no framework.

## Folder layout

```
index.html                         home page
about.html  privacy.html  404.html
assets/style.css                   all styling (colours at the top)
assets/lessons.js                  THE list of subjects / units / lessons
assets/nav.js                      builds the menu, unit list, prev/next from that list
electricity-magnetism/index.html   subject page
electricity-magnetism/unit-1/      one .html per lesson + that unit's PDFs
electricity-magnetism/unit-2/
sitemap.xml  robots.txt            for search engines (update the domain inside)
.nojekyll                          tells GitHub Pages to serve files exactly as they are
```

## Adding a lesson

1. In the unit folder, copy an existing lesson file, e.g. `1-1-coulombs-law.html`
   to `1-4-new-topic.html`. Edit the `<title>`, `<meta name="description">`,
   the `<h1>`, the blurb, the YouTube ID after `/embed/`, the PDF links, and
   the `data-lesson="1-4-new-topic"` attribute on `<body>`.
2. Put the PDFs in the same folder.
3. Add one line to the unit's `lessons` list in `assets/lessons.js`.
   The menu, the subject page, and the Previous/Next links update themselves.

Adding a unit: make a folder `unit-3`, give it an `index.html` (copy a unit
overview page), and add a unit block to `assets/lessons.js`.

## Testing on your computer

Double-clicking `index.html` works for everything except YouTube videos
(YouTube refuses to play from a `file://` address, "error 153"). To test
videos, serve the folder: open a terminal in this folder and run
`python -m http.server 8000`, then open http://localhost:8000.

## Publishing changes

The repo is https://github.com/luciferoanthony5-creator/tutoring-site and the
live site is https://luciferoanthony5-creator.github.io/tutoring-site/ .
Edit files in this folder, then in GitHub Desktop write a one-line summary,
click **Commit to main**, then **Push origin**. The site updates in about a minute.

## Putting it on GitHub Pages (first time, already done)

1. On github.com, click **New repository**. Name it (e.g. `physics-site`),
   keep it **Public**, do not add a README (this folder has one). Create it.
2. On the empty repo page click **uploading an existing file**, drag the
   entire contents of this folder in (all files and folders, including the
   hidden `.nojekyll`), and click **Commit changes**.
3. In the repo go to **Settings → Pages**. Under *Build and deployment* set
   Source to **Deploy from a branch**, Branch to **main** and folder **/ (root)**,
   then Save.
4. Wait a minute and reload the Pages settings: the site is live at
   `https://YOUR-USERNAME.github.io/physics-site/`.

Future edits: change a file on github.com (or upload a new version) and the
site updates within a minute or two. GitHub keeps a history of every change.

## Custom domain (later)

1. Buy the domain. In its DNS settings add four A records for `@` pointing
   to GitHub Pages' IPs (185.199.108.153, .109.153, .110.153, .111.153) and a
   CNAME record for `www` pointing to `YOUR-USERNAME.github.io`.
2. In **Settings → Pages → Custom domain** enter the domain and save; GitHub
   creates a `CNAME` file in the repo. Tick **Enforce HTTPS** once it is offered.
3. Replace `https://luciferoanthony5-creator.github.io/tutoring-site` in
   `sitemap.xml` and `robots.txt` with the real domain, and in `404.html`
   change `/tutoring-site/` to `/` (the 404 page needs absolute paths).

## Placeholders still in the site

- Site name `AntsPhysicsLessons` (set once in `assets/lessons.js`; also in
  `<title>` tags and `README.md`).
- Lesson video IDs `VIDEO_ID_11` etc. Only the two unit overview videos are real.
- Worksheets and answer keys are LaTeX-generated placeholders with a few real
  problems each. Sources and the generator script are in `latex-sources/` (run `python3 make_pdfs.py` there to rebuild).
- `about.html` email address; `privacy.html` text (expand before AdSense).
