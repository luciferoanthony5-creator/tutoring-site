/* =====================================================================
   nav.js  -  builds the parts of every page that come from lessons.js
     - the site name in the header and footer
     - the top menu (Home > Subject > Unit > Lesson fly-outs)
     - the unit list on a subject page
     - the Previous / Next links on a lesson page

   Each page tells this script where it is with attributes on <body>:
     data-root="../../"        path back to the site's top folder
     data-subject="..."        (subject and lesson pages) the subject slug
     data-unit="unit-1"        (lesson pages) the unit folder
     data-lesson="1-1-..."     (lesson pages) the lesson slug
   ===================================================================== */

/* $("id") is shorthand for document.getElementById("id"). */
const $ = (id) => document.getElementById(id);

/* Escape text before putting it into HTML so "&" or "<" in a title
   cannot be mistaken for HTML. */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const body = document.body;
const ROOT = body.dataset.root || "./";          // data-root -> dataset.root

/* Path from the site's top folder to a lesson page. */
const lessonPath = (subject, unit, lesson) =>
  `${ROOT}${subject.slug}/${unit.folder}/${lesson.slug}.html`;

/* Flatten every lesson into one ordered list; Previous / Next follow it. */
const ALL = SUBJECTS.flatMap((subject) =>
  subject.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({ ...lesson, subject, unit }))
  )
);

/* --- Site name (header + footer) ------------------------------------ */
for (const el of document.querySelectorAll("[data-site-name]")) {
  el.innerHTML = `${esc(SITE_NAME)}<span>${esc(SITE_TLD)}</span>`;
}
if ($("footer-name")) $("footer-name").textContent = `© ${new Date().getFullYear()} ${SITE_NAME}${SITE_TLD}`;

/* --- Top menu --------------------------------------------------------- */
function buildMenu() {
  let html = `<li><a href="${ROOT}index.html">Home</a></li>`;
  for (const subject of SUBJECTS) {
    html += `<li><a href="${ROOT}${subject.slug}/index.html">${esc(subject.short)}</a><ul>`;
    for (const unit of subject.units) {
      html += `<li><span class="menu-label" tabindex="0">Unit ${unit.number}: ${esc(unit.title)}</span><ul>`;
      for (const lesson of unit.lessons) {
        html += `<li><a href="${lessonPath(subject, unit, lesson)}">${esc(lesson.title)}</a></li>`;
      }
      html += `</ul></li>`;
    }
    html += `</ul></li>`;
  }
  html += `<li><a href="${ROOT}about.html">About</a></li>`;
  $("menu").innerHTML = html;
}

/* --- Phone menu button ------------------------------------------------ */
$("menu-btn").addEventListener("click", () => {
  const open = $("menu").classList.toggle("open");
  $("menu-btn").setAttribute("aria-expanded", String(open));
});

/* --- Subject page: list of units ------------------------------------- */
function buildUnitList() {
  const subject = SUBJECTS.find((s) => s.slug === body.dataset.subject);
  if (!subject || !$("unit-list")) return;
  let html = "";
  for (const unit of subject.units) {
    const overview = unit.lessons.find((l) => l.overview);
    // The unit heading is a link only when the unit has an overview page.
    const heading = overview
      ? `<a href="${lessonPath(subject, unit, overview)}">Unit ${unit.number} &ndash; ${esc(unit.title)}</a>`
      : `<span class="plain">Unit ${unit.number} &ndash; ${esc(unit.title)}</span>`;
    html += `<details class="unit" open><summary>${heading}</summary><ul class="lessons">`;
    for (const lesson of unit.lessons) {
      if (lesson.overview) continue;              // used as the heading already
      html += `<li${lesson.review ? ' class="review"' : ""}><a href="${lessonPath(subject, unit, lesson)}">${esc(lesson.title)}</a>`;
      if (lesson.note) html += `<div class="note">${esc(lesson.note)}</div>`;
      html += `</li>`;
    }
    html += `</ul></details>`;
  }
  $("unit-list").innerHTML = html;

  $("expand-all")?.addEventListener("click", () => {   // ?. = only if the button exists
    for (const d of document.querySelectorAll(".unit")) d.open = true;
  });
  $("collapse-all")?.addEventListener("click", () => {
    for (const d of document.querySelectorAll(".unit")) d.open = false;
  });
}

/* --- Lesson page: Previous / Next ------------------------------------ */
function buildPrevNext() {
  const bars = document.querySelectorAll("[data-prevnext]");
  if (!bars.length) return;
  const i = ALL.findIndex((l) =>
    l.subject.slug === body.dataset.subject &&
    l.unit.folder === body.dataset.unit &&
    l.slug === body.dataset.lesson);
  if (i < 0) return;                              // page not in lessons.js
  const me = ALL[i], prev = ALL[i - 1], next = ALL[i + 1];
  const link = (l) => `<a href="${lessonPath(l.subject, l.unit, l)}">`;
  const html = `
    <span>${prev ? `${link(prev)}&larr; ${esc(prev.title)}</a>` : `<span class="off">&larr; Start of list</span>`}</span>
    <span class="center"><a href="${ROOT}${me.subject.slug}/index.html">${esc(me.subject.title)}</a> &middot; Unit ${me.unit.number}</span>
    <span class="next">${next ? `${link(next)}${esc(next.title)} &rarr;</a>` : `<span class="off">End of list &rarr;</span>`}</span>`;
  for (const bar of bars) bar.innerHTML = html;
}

buildMenu();
buildUnitList();
buildPrevNext();
