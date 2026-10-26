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

/* $("id") is shorthand for document.getElementById("id") $ is the name of the function. */
const $ = (id) => document.getElementById(id); // defines a function using arrow syntax

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
    if (!subject.units.length) {                   // a subject with no lessons yet: plain link, no fly-out
      html += `<li><a href="${ROOT}${subject.slug}/index.html">${esc(subject.short)}</a></li>`;
      continue;                                    // skip to the next subject
    }
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
  if (!subject || !$("unit-list") || !subject.units.length) return;   // nothing to list yet
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
  const prev = ALL[i - 1], next = ALL[i + 1];      // neighbours in the flattened list
  const link = (l, cls, text) =>                   // builds one <a> (empty string if there is no lesson)
    l ? `<a class="${cls}" href="${lessonPath(l.subject, l.unit, l)}">${text}</a>` : "";
  const html = link(prev, "prev", `&larr; ${esc(prev?.title ?? "")}`) +   // ?. and ?? avoid errors when prev is missing
               link(next, "next", `${esc(next?.title ?? "")} &rarr;`);
  for (const bar of bars) bar.innerHTML = html;
}

/* --- Lesson page: outline of the current unit (left column) ----------- */
function buildOutline() {
  const wrap = document.querySelector(".page > .wrap");   // the content wrapper
  const subject = SUBJECTS.find((s) => s.slug === body.dataset.subject);
  const unit = subject?.units.find((u) => u.folder === body.dataset.unit);
  if (!wrap || !unit || !body.dataset.lesson) return;     // only lesson pages have these attributes
  const items = unit.lessons.map((lesson) => {
    const current = lesson.slug === body.dataset.lesson;  // is this the page we are on?
    return `<li><a href="${lessonPath(subject, unit, lesson)}"${current ? ' aria-current="page"' : ""}>${esc(lesson.title)}</a></li>`;
  }).join("");
  const aside = document.createElement("details");        // a collapsible box: open on desktop, closed on phones
  aside.className = "outline";
  aside.open = !matchMedia("(max-width: 900px)").matches;
  aside.innerHTML = `<summary>Unit ${unit.number}: ${esc(unit.title)}</summary><ul>${items}</ul>` +
    `<a class="all-link" href="${ROOT}${subject.slug}/index.html">All ${esc(subject.title)} lessons</a>`;
  wrap.classList.add("lesson-layout");                    // switches on the two-column layout in style.css
  wrap.prepend(aside);                                    // put the outline first inside the wrapper
  aside.style.gridRow = `1 / span ${wrap.children.length - 1}`;  // let it run alongside the other rows
}

/* --- Esc closes the open menu ----------------------------------------- */
document.addEventListener("keydown", (e) => {          // runs on every key press
  if (e.key !== "Escape") return;                      // ignore every key except Esc
  const menu = $("menu");
  if (menu.contains(document.activeElement)) {         // focus is inside the menu
    document.activeElement.blur();                     // drop focus: the :focus-within fly-out closes
    if (menu.classList.contains("open")) {             // phone menu panel
      menu.classList.remove("open");
      $("menu-btn").setAttribute("aria-expanded", "false");
      $("menu-btn").focus();                           // put the keyboard back on the Menu button
    }
  }
});

/* --- Home page: fade the headline in word by word ---------------------- */
function revealHeadline() {
  const h = document.querySelector("h1.reveal");
  if (!h || matchMedia("(prefers-reduced-motion: reduce)").matches) return;   // reduced motion: leave the text plain
  const words = h.textContent.trim().split(/\s+/);     // "a b c" -> ["a","b","c"]
  h.setAttribute("aria-label", words.join(" "));       // screen readers read the whole sentence, not word fragments
  h.innerHTML = words
    .map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${esc(w)}</span>`)   // --i = word number, used for the delay in CSS
    .join(" ");                                        // spaces between the spans let the line wrap normally
  const threeQuarters = 150 + Math.round(words.length * 40 * 0.75);   // ms when 3/4 of the words have started (150 and 40 match the CSS)
  h.closest(".hero").style.setProperty("--after-h", `${threeQuarters}ms`);   // paragraph starts 3/4 of the way through the quote, so there is no long pause
}

buildMenu();
revealHeadline();
buildUnitList();
buildPrevNext();
buildOutline();
