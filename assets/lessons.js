/* GENERATED FILE: scripts/build.py writes this from content/. Do not edit it by hand.
   To change the site name edit content/site.json; subjects and units are in content/subjects.json;
   lessons are in content/lessons/. Then run: python3 scripts/build.py
   nav.js builds the menu, unit lists, outline and Previous / Next links from this list. */

const SITE_NAME = "AntsPhysicsLessons";   // const declares a value -- the site name
const SITE_TLD  = ".com";

const SUBJECTS = [
  {
    "slug": "electricity-magnetism",
    "title": "Electricity & Magnetism",
    "short": "E&M",
    "units": [
      {
        "number": 1,
        "folder": "unit-1",
        "title": "Electric Charge, Force, and Field",
        "lessons": [
          {
            "slug": "index",
            "title": "Unit 1 Overview: Electric Charge, Force, and Field",
            "overview": true
          },
          {
            "slug": "1-1-coulombs-law",
            "title": "1.1 Coulomb's Law and Superposition"
          },
          {
            "slug": "1-2-electric-field",
            "title": "1.2 Electric Field of Point Charges"
          },
          {
            "slug": "1-3-charges-in-fields",
            "title": "1.3 Charges in Uniform Fields",
            "note": "Uses projectile-motion ideas from Mechanics."
          },
          {
            "slug": "unit-1-review",
            "title": "Unit 1 Review",
            "review": true
          }
        ]
      },
      {
        "number": 2,
        "folder": "unit-2",
        "title": "Gauss's Law",
        "lessons": [
          {
            "slug": "index",
            "title": "Unit 2 Overview: Continuous Charge Distributions and Gauss's Law",
            "overview": true
          },
          {
            "slug": "2-1-continuous-charge",
            "title": "2.1 Fields of Continuous Charge Distributions",
            "note": "Requires integration by substitution."
          },
          {
            "slug": "2-2-flux-and-gauss",
            "title": "2.2 Electric Flux and Gauss's Law: Spherical Symmetry"
          },
          {
            "slug": "2-3-cylindrical-planar",
            "title": "2.3 Gauss's Law: Cylindrical and Planar Symmetry"
          },
          {
            "slug": "unit-2-review",
            "title": "Unit 2 Review",
            "review": true
          }
        ]
      }
    ]
  },
  {
    "slug": "mechanics",
    "title": "Mechanics",
    "short": "Mechanics",
    "units": []
  }
];
