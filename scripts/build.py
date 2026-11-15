#!/usr/bin/env python3
"""build.py  -  turns the lesson data in content/ into the site's pages.

Run it from the repo's top folder:   python3 scripts/build.py
(GitHub also runs it automatically after every push; see .github/workflows/build.yml.)

It reads:
  content/site.json          site name and web address
  content/subjects.json      subjects and their units
  content/lessons/*.json     one file per lesson (written by hand or by the Pages CMS editor)
  templates/lesson.html      the page every lesson is poured into

It writes:
  <subject>/unit-N/<lesson>.html   one real page per lesson
  assets/lessons.js                the list nav.js uses for menus, outlines and Previous/Next
  sitemap.xml                      the page list for search engines
  content/.generated.json          which pages it made (so a deleted lesson's page is removed)

It only needs Python 3; there is nothing to install.
"""
import html       # html.escape() makes text safe to put inside HTML
import json       # reads and writes .json files
import re         # regular expressions: pattern matching on text
import sys        # sys.exit() stops the script with an error
from pathlib import Path   # Path = a file or folder location

ROOT = Path(__file__).resolve().parent.parent     # the repo's top folder (this file sits in scripts/)
CONTENT = ROOT / "content"                        # "/" joins path pieces
MANIFEST = CONTENT / ".generated.json"            # remembers which pages the last run made
STATIC_PAGES = ["index.html", "about.html", "privacy.html"]   # hand-written pages listed in the sitemap


def load(path):
    """Read one JSON file; stop with a clear message if it is broken."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as err:             # the file is not valid JSON
        sys.exit(f"ERROR: {path.relative_to(ROOT)} is not valid JSON: {err}")


def esc(text):
    """Escape & < > and quotes so a title cannot be mistaken for HTML."""
    return html.escape(str(text), quote=True)


def slugify(text):
    """'1.1 Coulomb's Law' -> '1-1-coulombs-law' (lowercase letters, digits and dashes only)."""
    text = str(text).lower().replace("'", "").replace("’", "")   # drop apostrophes instead of turning them into dashes
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")                # every other run of odd characters becomes one dash


def youtube_id(value):
    """Accept a full YouTube link or a bare video ID and return just the ID ('' if empty)."""
    value = str(value or "").strip()
    match = re.search(r"(?:v=|youtu\.be/|/embed/|/shorts/|/live/)([A-Za-z0-9_-]{6,})", value)   # the ID follows one of these markers
    return match.group(1) if match else value      # no marker: assume it already is an ID


def file_link(path, label, kind, root):
    """One download row. kind is 'ws' (worksheet, red tag), 'key' (answer key, blue tag) or '' (grey tag)."""
    path = str(path).strip().lstrip("/")            # stored as /files/name.pdf; make it relative to the site's top folder
    name = path.rsplit("/", 1)[-1]                  # the file name after the last slash
    tag = f"pdf {kind}".strip()
    return (f'      <a href="{esc(root + path)}"><span class="{tag}">PDF</span>'
            f'{esc(label)}<span class="file">{esc(name)}</span></a>\n')


def main():
    site = load(CONTENT / "site.json")
    subjects = load(CONTENT / "subjects.json")
    template = (ROOT / "templates" / "lesson.html").read_text(encoding="utf-8")
    by_slug = {s["slug"]: s for s in subjects}      # look a subject up by its folder name

    # ---- read every lesson file and attach it to its unit ----------------
    problems = []                                   # collected and shown together at the end
    for subject in subjects:
        for unit in subject["units"]:
            unit["lessons"] = []                    # filled in below
    for path in sorted((CONTENT / "lessons").glob("*.json")):
        lesson = load(path)
        where = path.relative_to(ROOT)
        if not lesson.get("published", True):       # unticked "Published" box: skip, the page is not made
            continue
        subject = by_slug.get(lesson.get("subject"))
        if not subject:
            problems.append(f"{where}: unknown subject {lesson.get('subject')!r}")
            continue
        unit = next((u for u in subject["units"] if str(u["number"]) == str(lesson.get("unit"))), None)   # str() so 1 and "1" both match
        if not unit:
            problems.append(f"{where}: {subject['title']} has no unit {lesson.get('unit')!r} (add it under Subjects and units first)")
            continue
        if not str(lesson.get("title", "")).strip():
            problems.append(f"{where}: the lesson has no title")
            continue
        kind = lesson.get("kind") or "lesson"
        stem = path.stem                            # file name without .json
        if stem.startswith(subject["slug"] + "-"):  # files are named <subject>-<lesson>; drop the subject part
            stem = stem[len(subject["slug"]) + 1:]
        lesson["slug"] = "index" if kind == "overview" else (slugify(stem) or slugify(lesson["title"]))   # the overview is the unit folder's index.html
        lesson["kind"] = kind
        unit["lessons"].append(lesson)

    # ---- order the lessons in each unit: overview, lessons by number, review ----
    rank = {"overview": 0, "lesson": 1, "review": 2}
    for subject in subjects:
        for unit in subject["units"]:
            unit["folder"] = f"unit-{unit['number']}"
            unit["lessons"].sort(key=lambda l: (rank.get(l["kind"], 1), l.get("order") or 0, l["title"]))
            seen = set()
            for lesson in unit["lessons"]:          # two lessons must not want the same page address
                if lesson["slug"] in seen:
                    problems.append(f"{subject['slug']}/{unit['folder']}: two lessons would both be {lesson['slug']}.html")
                seen.add(lesson["slug"])
    if problems:
        sys.exit("ERROR: nothing was written.\n  " + "\n  ".join(problems))

    # ---- write one page per lesson ----------------------------------------
    made = []                                       # pages written this run
    root = "../../"                                 # a lesson page sits two folders below the top
    for subject in subjects:
        for unit in subject["units"]:
            for lesson in unit["lessons"]:
                number = re.match(r"\d+\.\d+", lesson["title"])           # "1.1" at the start of the title, if any
                suffix = f" {number.group(0)}" if number else ""
                rows = ""
                if lesson.get("worksheet"):
                    rows += file_link(lesson["worksheet"], lesson.get("worksheet_label") or f"Worksheet{suffix}", "ws", root)
                if lesson.get("answer_key"):
                    rows += file_link(lesson["answer_key"], lesson.get("answer_key_label") or f"Answer key{suffix}", "key", root)
                for extra in lesson.get("extras") or []:
                    if extra.get("file"):
                        rows += file_link(extra["file"], extra.get("label") or "Extra practice", "", root)
                downloads = ('    <!-- Downloads, in order: worksheet, answer key, extras. -->\n'
                             f'    <div class="downloads">\n{rows}    </div>\n') if rows else ""
                vid = youtube_id(lesson.get("video"))
                video = ('    <!-- Video: the YouTube ID comes from the lesson\'s "video" field. -->\n'
                         '    <div class="video">\n'
                         f'      <iframe src="https://www.youtube-nocookie.com/embed/{esc(vid)}"\n'
                         f'              title="{esc(lesson["title"])}"\n'
                         '              allow="fullscreen" loading="lazy"\n'
                         '              referrerpolicy="strict-origin-when-cross-origin"></iframe>\n'
                         '    </div>\n') if vid else ""
                author = str(lesson.get("author") or "").strip()
                byline = f'      <p class="byline">Lesson by {esc(author)}</p>\n' if author else ""
                values = {                          # what goes into each {{placeholder}} of the template
                    "title": esc(lesson["title"]), "summary": esc(lesson.get("summary") or ""),
                    "subject_title": esc(subject["title"]), "site_name": esc(site["name"]),
                    "root": root, "subject": esc(subject["slug"]), "unit_folder": unit["folder"],
                    "slug": esc(lesson["slug"]), "byline": byline, "video": video, "downloads": downloads,
                }
                page = re.sub(r"\{\{(\w+)\}\}", lambda m: values[m.group(1)], template)   # swap every {{name}} for its value
                out = ROOT / subject["slug"] / unit["folder"] / f"{lesson['slug']}.html"
                out.parent.mkdir(parents=True, exist_ok=True)   # make the unit folder if it is new
                out.write_text(page, encoding="utf-8")
                made.append(str(out.relative_to(ROOT)))

    # ---- remove pages of lessons that no longer exist ----------------------
    old = load(MANIFEST) if MANIFEST.exists() else []
    for stale in set(old) - set(made):
        target = ROOT / stale
        if target.exists():
            target.unlink()                         # unlink = delete the file
            print(f"removed {stale}")
    MANIFEST.write_text(json.dumps(sorted(made), indent=2) + "\n", encoding="utf-8")

    # ---- assets/lessons.js: the list nav.js reads --------------------------
    listing = []
    for subject in subjects:
        units = []
        for unit in subject["units"]:
            lessons = []
            for lesson in unit["lessons"]:
                item = {"slug": lesson["slug"], "title": lesson["title"]}
                if lesson["kind"] == "overview": item["overview"] = True
                if lesson["kind"] == "review": item["review"] = True
                if lesson.get("note"): item["note"] = lesson["note"]
                lessons.append(item)
            units.append({"number": unit["number"], "folder": unit["folder"], "title": unit["title"], "lessons": lessons})
        listing.append({"slug": subject["slug"], "title": subject["title"], "short": subject.get("short") or subject["title"], "units": units})
    js = ("/* GENERATED FILE: scripts/build.py writes this from content/. Do not edit it by hand.\n"
          "   To change the site name edit content/site.json; subjects and units are in content/subjects.json;\n"
          "   lessons are in content/lessons/. Then run: python3 scripts/build.py\n"
          "   nav.js builds the menu, unit lists, outline and Previous / Next links from this list. */\n\n"
          f"const SITE_NAME = {json.dumps(site['name'])};   // const declares a value -- the site name\n"
          f"const SITE_TLD  = {json.dumps(site.get('tld', ''))};\n\n"
          f"const SUBJECTS = {json.dumps(listing, indent=2, ensure_ascii=False)};\n")
    (ROOT / "assets" / "lessons.js").write_text(js, encoding="utf-8")

    # ---- sitemap.xml -------------------------------------------------------
    base = site["url"].rstrip("/")
    pages = STATIC_PAGES + [f"{s['slug']}/index.html" for s in subjects] + made
    urls = "".join(f"  <url><loc>{esc(base)}/{esc(p)}</loc></url>\n" for p in pages)
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n', encoding="utf-8")

    print(f"built {len(made)} lesson pages, assets/lessons.js and sitemap.xml")


if __name__ == "__main__":      # run main() only when this file is run directly
    main()
