Begin each response with my name: Anthony

# Website Plan: Tutoring Lesson Platform

Status: Phase 2 done. The site is live on GitHub Pages at https://luciferoanthony5-creator.github.io/tutoring-site/ . Now in Phase 3 (content). See section 12 for how edits get made and published.

How to use this file: upload it at the start of a new Claude session (or rely on the copy saved in the "Website" Claude project) so the session starts from the same decisions and assumptions. Edit anything. Section 5 lists decisions; section 9 lists what Claude is assuming; section 10 is open questions; section 11 is for Anthony's notes; section 12 is the editing and publishing workflow.

---

## 1. Concept

Open-access tutoring site. No logins, no accounts, no backend, no database. Static content only: subject pages, collapsible unit lists, embedded videos, downloadable PDF worksheets and answer keys. Long-term monetization through ad revenue (Google AdSense).

Structural reference: calculus.flippedmath.com. Only the structure is borrowed. Layout, wording, styling, videos, and worksheets are all original.

First subject: **Electricity & Magnetism** (AP Physics C: Electricity and Magnetism / intro college level, calculus-based).

## 2. Reference pattern (what flippedmath does)

- Top nav: Home, List of Lessons, Version #1, Version #2, and so on, with fly-out menus going Version > Unit > Lesson.
- Version page: short intro paragraph, then one long list. Bold unit headings, each lesson a link beneath, occasional plain-text notes under a lesson, bolded mid-unit and end-of-unit review links.
- Lesson page: Previous Lesson / title / Next Lesson across the top, one embedded YouTube video, then PDF downloads stacked underneath (packet, solutions, corrective assignments).

## 3. Site map

```
Home                        short pitch + a link/card per subject
├── Electricity & Magnetism subject page: all units, lessons listed under each
│   ├── Unit 1              (optional page: overview video and/or worksheet)
│   │   ├── 1.1 Lesson      video + worksheets
│   │   ├── 1.2 Lesson
│   │   └── Unit 1 Review
│   └── Unit 2 ...
├── Subject 2 ...
├── About / Contact
└── Privacy Policy          (needed later for AdSense)
```

## 4. Page templates (three total)

**Home.** Site name, one-line description, subject links.

**Subject page.** Intro sentence, then units. The unit heading ("Unit 1 – Topic") is a link only when that unit has an overview page; otherwise it is plain bold text. Lessons are listed below it as links. Units are collapsible (see Decisions).

**Lesson page.** Prev/next bar, title, responsive video embed, then worksheet downloads directly under the video. Unit overview pages reuse this exact template. The template must handle three cases gracefully: video + worksheets, worksheets only, video only.

Downloads on a lesson page, in order: worksheet, answer key, any extra practice.

One video per lesson is the norm.

Subject-specific note (Electricity & Magnetism only; other subjects may differ): the unit overview video is the conceptual overview, and the lesson videos are worked example problems. So most E&M units will have an overview page, and the unit heading will usually be a link.

## 5. Decisions made

| Decision | Choice |
| --- | --- |
| Build approach | Fully custom-coded static site, built with Claude (chat / Claude Code) |
| Hosting | GitHub Pages (free). Repo `luciferoanthony5-creator/tutoring-site`, branch `main`, folder `/ (root)` |
| Domain | Owned custom domain pointed at GitHub Pages, roughly $10–15/year |
| Video | Uploaded to YouTube (unlisted is fine), embedded by iframe, never linked out |
| Units on subject page | Collapsible, using native `<details>` elements, with expand-all / collapse-all buttons; units start expanded |
| Answer keys | Posted openly on lesson pages |
| First subject | Electricity & Magnetism |
| Level of first subject | AP Physics C: Electricity and Magnetism / intro college, calculus-based |
| Site name and domain | `AntsPhysicsLessons.com` is a placeholder; real name to be decided by Anthony, probably during production |
| Colors and fonts | Chosen: option A "Field Lines" – IBM Plex Serif headings, IBM Plex Sans body, blue accent (#1F5FD1), cool light-grey paper; dark mode follows the visitor's system setting |
| Prototype unit and lesson titles | Placeholders |
| Videos per lesson | One |
| AdSense timing | Apply after one full subject is live |
| Lesson pages | One real HTML file per lesson (not a single page that swaps content), for search indexing and AdSense review |

Reasoning for this approach: plain files with nothing proprietary in the way gives the highest ceiling for the secondary goal of learning to edit and design the code, at effectively $0 hosting cost.

## 6. File structure (production)

```
/index.html
/electricity-magnetism/index.html
/electricity-magnetism/unit-1/index.html            (optional overview)
/electricity-magnetism/unit-1/1-1-topic-name.html
/electricity-magnetism/unit-1/1-1-worksheet.pdf
/electricity-magnetism/unit-1/1-1-solutions.pdf
/assets/style.css
/assets/nav.js
/assets/lessons.js          single list of subjects / units / lessons
/about.html
/privacy.html
/404.html
/CNAME                      custom domain for GitHub Pages
```

Naming convention: `1-1-topic-name.html`, `1-1-worksheet.pdf`, `1-1-solutions.pdf`.

How the pieces fit: every lesson is its own HTML file, but the top nav and the prev/next links are generated by `nav.js` from the one list in `lessons.js`. Adding a lesson means: copy a lesson file, change the video ID and PDF names, add one line to `lessons.js`. Menu changes never require editing every page.

Video embed:

```html
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
        allow="fullscreen" loading="lazy"></iframe>
```

Wrapped in a container that keeps a 16:9 shape at any screen width.

## 7. Phases

**Phase 1 – Prototype.** One subject (Electricity & Magnetism), two units, three or four lessons with placeholder videos and dummy PDFs, built as a clickable artifact. Goal: confirm the nav, the expand/collapse behavior, the lesson layout, and how it looks on a phone. Decide colors and fonts here. The site name stays as the placeholder `AntsPhysicsLessons.com`.

Where it gets built: as a Claude artifact in a claude.ai chat, a single self-contained HTML file that opens in the browser. Consequences of that:
- An artifact is one file, so the prototype imitates multiple pages by switching views inside that file. The look and navigation will match the final site; the file layout will not. Splitting into real files happens in Phase 2.
- Artifacts block outside content, so YouTube embeds will likely not play there. The prototype uses a placeholder box the same size and shape as the video.
- PDF links will be dummies.
- The same HTML file can be downloaded and opened locally on a computer, where a real YouTube embed can be tested.

**Phase 1 is done** (artifact: https://claude.ai/artifact/3Bem9F3g6BYpfraeeunVhF).

**Phase 2 – Production (done except the custom domain).** Create the GitHub repo, split the prototype into the file structure above, enable Pages, buy the domain and point DNS at it, turn on HTTPS. Upload videos to YouTube and use the `youtube-nocookie.com` embed domain. Add a sitemap and page titles/descriptions for SEO. Claude Code is a good fit for this phase since it works directly with a folder of files.

GitHub Pages flow:
1. Create a GitHub repository
2. Add site files (HTML/CSS/JS, PDFs)
3. Enable GitHub Pages in repo settings
4. Get a live URL (`username.github.io/repo-name`)
5. Point the custom domain at it
6. Future edits: change a file, save to GitHub, site updates automatically (and builds a change history)

**Phase 3 – Content.** Fill out one full subject before starting the next. A complete subject is more useful to visitors and stronger for an AdSense application than three half-finished ones.

**Phase 4 – Monetization.** Add the privacy policy and about/contact pages, reserve ad slots in the lesson template so ads don't shift the layout later, then apply once one full subject is live. Since students will be a big share of the audience, check Google's current rules on child-directed content before applying.

## 8. Revenue plan (for later, once one full subject is live)

Mechanism: AdSense provides a JavaScript snippet placed once site-wide in the head, plus small ad-unit snippets wherever ads should appear. Works the same on a static GitHub Pages site as on any other host.

Approval requirements to verify directly with Google before investing heavy time:
- Own custom domain, not a `github.io` subdomain (already the plan)
- A meaningful amount of original content; the plan is one full subject live before applying
- Compliance with content policies, including possible extra rules for sites likely to attract child traffic (e.g., personalized ad restrictions)
- Some traffic history is often expected

Expectations: revenue from a niche educational site is typically modest early and scales with traffic, which usually takes sustained content and SEO effort over months. Treat monetization as a feature to build toward, not immediate income. Not financial advice; check Google's current AdSense documentation for exact eligibility requirements.

## 9. Assumptions Claude is working from

Correct any of these that are wrong.

1. Anthony creates all videos and worksheets himself; no third-party content is reused.
2. The audience is mainly high school and early college students, plus teachers.
3. The site is English-only.
4. No search box, comments, progress tracking, or quizzes in the first version.
5. Nothing on the site collects personal data before ads and analytics are added.
6. The top nav uses the flippedmath fly-out idea (Subject > Unit > Lesson) on desktop and collapses to a menu button on phones.
7. Units start expanded (decided from the prototype).
8. Unit and lesson names in the prototype are placeholders until a real E&M outline is supplied. Placeholders should still sound like AP Physics C: E&M topics.
9. Anthony is new to HTML/CSS/JS and wants code that is readable and commented over code that is clever. He prefers a comment next to each line explaining the syntax over a paragraph at the top that only summarizes what the code does.
10. Review lessons ("Unit 1 Review") use the same lesson template.
11. Each lesson has one video. The template does not need to support several videos on one page.
12. The site name shown in the prototype is a placeholder and should be easy to change in one place.

## 10. Open questions

None right now. Earlier questions were answered and moved into sections 4, 5, and 9.

## 11. Notes for myself (Anthony)

- Add a short terms note saying worksheets are free for classroom use.
- Size check: GitHub Pages has a soft limit of about 1 GB per site, which is plenty for PDFs as long as videos stay on YouTube.
- Decide the real site name and domain (`AntsPhysicsLessons.com` is only a placeholder).

## 12. Workflow: how edits get made and published

Set up on 2026-09-17. This is the loop for every change from now on.

**Where things live**

| Thing | Location |
| --- | --- |
| GitHub repo | https://github.com/luciferoanthony5-creator/tutoring-site |
| Live site | https://luciferoanthony5-creator.github.io/tutoring-site/ |
| Local clone (made by GitHub Desktop) | `C:\Users\lucif\Documents\GitHub\tutoring-site` on the Windows laptop "rogzephyrus" |
| This plan + a progress log | Claude project "Website" (`claude/website-plan.md`, `claude/progress-log.md`) |

The clone folder is the single source of truth. The older copy at `Documents\physics-site` and the downloaded zips are stale and can be deleted.

**The loop**

1. Start a Claude (Cowork) session on the Windows laptop, linked to this computer, with the `Documents` folder added (Claude needs it to reach the clone). Say what to change.
2. Claude edits or creates files directly inside `Documents\GitHub\tutoring-site`. Claude can create and overwrite files there but cannot delete or rename them; when a file needs deleting, Claude says which one and Anthony deletes it in VS Code or Explorer.
3. Open GitHub Desktop. The changed files appear in the left panel. Type a one-line summary (e.g. "add lesson 1.4"), click **Commit to main**, then **Push origin**.
4. About a minute later the live site shows the change. Refresh; if it looks stale, hard-refresh (Ctrl+F5).
5. Anthony can also edit files himself in VS Code and push the same way; Claude picks up those edits next session because it reads the files from the clone.

**Adding a lesson** (also in the repo's README.md)

1. In the unit folder, copy an existing lesson file (e.g. `1-1-coulombs-law.html` to `1-4-topic.html`). Edit the `<title>`, `<meta name="description">`, the `<h1>`, the blurb, the YouTube ID after `/embed/`, the PDF links, and `data-lesson="1-4-topic"` on `<body>`.
2. Put the PDFs in the same folder.
3. Add one line to that unit's `lessons` list in `assets/lessons.js`. The menu, subject page, and Previous/Next links update themselves.

Adding a unit: new folder `unit-3` with an `index.html` overview (copy one) and a unit block in `assets/lessons.js`.

**Testing on the laptop**: double-clicking `index.html` works for everything except YouTube (error 153 from a `file://` address). To test videos locally, run `python -m http.server 8000` in the clone folder and open http://localhost:8000. Or just push and check the live site.

**Placeholder PDFs**: made from LaTeX. Sources and `make_pdfs.py` are in `latex-sources/`; run the script (needs pdflatex) to rebuild, or replace the PDFs with real ones and keep the same file names.

**When the custom domain arrives**: follow the README's "Custom domain" section, then change three things: the base URL in `sitemap.xml` and `robots.txt`, and `/tutoring-site/` to `/` in `404.html`.

**Still placeholder**: site name `AntsPhysicsLessons` (set in `assets/lessons.js` and page `<title>`s), lesson video IDs `VIDEO_ID_11` etc. (only the two unit overview videos are real), the worksheets, the About page email, the Privacy page text.
