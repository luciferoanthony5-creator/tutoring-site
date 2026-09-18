/* =====================================================================
   lessons.js  -  THE ONE LIST
   Every page loads this file. The top menu, the unit list on a subject
   page, and the Previous / Next links are all generated from it by nav.js.

   To add a lesson:
     1. copy an existing lesson .html file in the unit folder and edit it
     2. put its PDFs in the same folder
     3. add one line to the right unit's "lessons" list below

   Field guide:
     slug     - file name without .html, e.g. "1-1-coulombs-law"
     title    - shown in menus, lists, and prev/next links
     review   - true for a review page (bold in the unit list)
     overview - true for the unit overview page (it is the unit's
                index.html and the unit heading becomes a link to it)
     note     - optional one-line note shown under the lesson in the list
   ===================================================================== */

const SITE_NAME = "AntsPhysicsLessons";     // placeholder - change here only
const SITE_TLD  = ".com";

const SUBJECTS = [
  {
    slug: "electricity-magnetism",           // folder name
    title: "Electricity & Magnetism",
    short: "E&M",                            // menu label
    units: [
      {
        number: 1,
        folder: "unit-1",                    // sub-folder name
        title: "Electric Charge, Force, and Field",
        lessons: [
          { slug: "index", overview: true, title: "Unit 1 Overview: Electric Charge, Force, and Field" },
          { slug: "1-1-coulombs-law",       title: "1.1 Coulomb's Law and Superposition" },
          { slug: "1-2-electric-field",     title: "1.2 Electric Field of Point Charges" },
          { slug: "1-3-charges-in-fields",  title: "1.3 Charges in Uniform Fields", note: "Uses projectile-motion ideas from Mechanics." },
          { slug: "unit-1-review", review: true, title: "Unit 1 Review" },
        ],
      },
      {
        number: 2,
        folder: "unit-2",
        title: "Gauss's Law",
        lessons: [
          { slug: "index", overview: true, title: "Unit 2 Overview: Continuous Charge Distributions and Gauss's Law" },
          { slug: "2-1-continuous-charge",  title: "2.1 Fields of Continuous Charge Distributions", note: "Requires integration by substitution." },
          { slug: "2-2-flux-and-gauss",     title: "2.2 Electric Flux and Gauss's Law: Spherical Symmetry" },
          { slug: "2-3-cylindrical-planar", title: "2.3 Gauss's Law: Cylindrical and Planar Symmetry" },
          { slug: "unit-2-review", review: true, title: "Unit 2 Review" },
        ],
      },
    ],
  },
  // A second subject goes here as another { ... } block.
];
