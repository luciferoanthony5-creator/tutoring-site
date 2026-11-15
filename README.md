# AntsPhysicsLessons (placeholder name)

Free physics video lessons and worksheets. A plain static site: HTML, CSS, one
small JavaScript file, and PDFs. No framework; one small Python script
(`scripts/build.py`) builds the lesson pages from `content/`.

## Folder layout

```
index.html                         home page
about.html  privacy.html  404.html
assets/style.css                   all styling (colours at the top)
content/                           lesson data: site.json, subjects.json, lessons/*.json
templates/lesson.html              the page every lesson is built from
scripts/build.py                   builds lesson pages, assets/lessons.js, sitemap.xml
files/                             PDFs uploaded through the editor
.pages.yml                         the editor's forms (Pages CMS)
assets/lessons.js                  GENERATED list of subjects / units / lessons
assets/nav.js                      builds the menu, unit list, prev/next from that list
assets/demos.js                    the physics demos (field, projectile)
assets/video/                      home-page background loop (made by manim-sources/)
manim-sources/                     scene.py + render.py: python3 manim-sources/render.py (needs manim, ffmpeg)
mechanics/index.html               subject page (no lessons yet)
electricity-magnetism/index.html   subject page
electricity-magnetism/unit-1/      one .html per lesson + that unit's PDFs
electricity-magnetism/unit-2/
sitemap.xml  robots.txt            for search engines (update the domain inside)
.nojekyll                          tells GitHub Pages to serve files exactly as they are
```

## Adding a lesson

Lessons are data, not hand-made pages. Each lesson is one small file in
`content/lessons/`; `scripts/build.py` turns them into the lesson pages,
`assets/lessons.js` and `sitemap.xml` (do not edit those by hand).

**In the browser (you and invited tutors):** open https://app.pagescms.org,
choose this site, then Lessons > Add an entry. Fill in the title, subject, unit,
paste the YouTube link, drag in the worksheet and answer key PDFs, and Save.
The site rebuilds itself in a minute or two.

**By hand:** copy a file in `content/lessons/`, edit it, put the PDFs in
`files/`, then run `python3 scripts/build.py`.

Adding a unit: add it under "Subjects and units" in the editor (or in
`content/subjects.json`). Adding a subject also needs a subject page
(`<subject>/index.html`) and a line in the `subject` list in `.pages.yml`.

## One-time setup for the editor (owner only)

1. Push this repo, then on GitHub: Settings > Pages > Build and deployment >
   Source: **GitHub Actions**. (Until you do, the "Build and publish" run on the
   Actions tab shows a red X at the publish step and the site only updates when
   you push yourself.)
2. Go to https://app.pagescms.org, sign in with GitHub, and install the Pages CMS
   GitHub App on the `tutoring-site` repo only.
3. Open the repo there; the forms come from `.pages.yml`.
4. To invite a tutor: Collaborators > enter their email. They get a sign-in link
   and need no GitHub account. They can add and edit lessons and PDFs, nothing else.

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
2. In **Settings → Pages → Custom domain** enter the domain and save.
   Tick **Enforce HTTPS** once it is offered.
3. Put the real address in `content/site.json` (`url`, and the new `name` and
   `tld`) and in `robots.txt`; in `404.html` change `/tutoring-site/` to `/`
   (the 404 page needs absolute paths). Run `python3 scripts/build.py`.

## Placeholders still in the site

- Site name `AntsPhysicsLessons` (set once in `content/site.json`; also in
  `<title>` tags and `README.md`).
- Lesson video IDs `VIDEO_ID_11` etc. Only the two unit overview videos are real.
- Worksheets and answer keys are LaTeX-generated placeholders with a few real
  problems each. Sources and the generator script are in `latex-sources/` (run `python3 make_pdfs.py` there to rebuild).
- `about.html` email address; `privacy.html` text (expand before AdSense).
