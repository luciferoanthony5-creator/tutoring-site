"""
Generates the placeholder worksheet / answer-key PDFs with LaTeX.

Run:  python3 make_pdfs.py
Needs: pdflatex (TeX Live). Output goes to ./pdfs/ and the .tex sources
are kept in ./tex/ so they can be edited by hand later.

Every lesson below is a dict with a list of problems. Each problem is
(statement, solution). The same problem list produces two PDFs: the
worksheet (statement + blank work space) and the solutions (statement +
worked answer).
"""
import os, subprocess, pathlib

SITE = "AntsPhysicsLessons.com"           # placeholder site name
SUBJECT = "Electricity \\& Magnetism"

# ---------------------------------------------------------------------------
# Problem bank. LaTeX math goes inside $...$.
# ---------------------------------------------------------------------------
LESSONS = {
  "1-1": {
    "unit": "Unit 1 -- Electric Charge, Force, and Field",
    "title": "1.1 Coulomb's Law and Superposition",
    "problems": [
      (r"Two point charges, $q_1 = +3.0\,\mu\text{C}$ and $q_2 = -5.0\,\mu\text{C}$, are $0.20$~m apart. Find the magnitude of the force each exerts on the other and state whether it is attractive or repulsive.",
       r"$F = \dfrac{k|q_1 q_2|}{r^2} = \dfrac{(8.99\times10^{9})(3.0\times10^{-6})(5.0\times10^{-6})}{(0.20)^2} = 3.4\ \text{N}$. Opposite signs, so the force is \textbf{attractive}."),
      (r"Three charges lie on the $x$-axis: $+2.0\,\mu\text{C}$ at $x=0$, $-2.0\,\mu\text{C}$ at $x=0.10$~m, and $+4.0\,\mu\text{C}$ at $x=0.30$~m. Find the net force (magnitude and direction) on the $+4.0\,\mu\text{C}$ charge.",
       r"From the $+2.0\,\mu$C charge (repulsive, $+x$): $F_1 = \dfrac{k(2.0\times10^{-6})(4.0\times10^{-6})}{(0.30)^2} = 0.80$~N. From the $-2.0\,\mu$C charge (attractive, $-x$): $F_2 = \dfrac{k(2.0\times10^{-6})(4.0\times10^{-6})}{(0.20)^2} = 1.80$~N. Net: $F = 0.80 - 1.80 = -1.0$~N, i.e.\ \textbf{1.0~N toward $-x$}."),
      (r"Two identical small spheres carry charges $q$ and $3q$ and repel with force $F$. They are touched together and separated to the same distance. Find the new force in terms of $F$.",
       r"After contact each carries $2q$. The product of charges goes from $3q^2$ to $4q^2$, so the new force is $\tfrac{4}{3}F$."),
    ],
  },
  "1-2": {
    "unit": "Unit 1 -- Electric Charge, Force, and Field",
    "title": "1.2 Electric Field of Point Charges",
    "problems": [
      (r"Find the magnitude of the electric field $0.050$~m from a point charge of $+8.0$~nC.",
       r"$E = \dfrac{kq}{r^2} = \dfrac{(8.99\times10^{9})(8.0\times10^{-9})}{(0.050)^2} = 2.9\times10^{4}\ \text{N/C}$, directed away from the charge."),
      (r"A charge $+q$ sits at $x=0$ and a charge $+4q$ sits at $x=d$. Where on the $x$-axis is the net electric field zero?",
       r"Only between the charges can the fields cancel. Set $\dfrac{kq}{x^2} = \dfrac{4kq}{(d-x)^2}$, so $(d-x)^2 = 4x^2$ and $d - x = 2x$, giving $x = d/3$."),
      (r"An electron is released from rest in a uniform field of $2.0\times10^{3}$~N/C. Find its acceleration (magnitude and direction relative to $\vec{E}$).",
       r"$a = \dfrac{eE}{m_e} = \dfrac{(1.60\times10^{-19})(2.0\times10^{3})}{9.11\times10^{-31}} = 3.5\times10^{14}\ \text{m/s}^2$, opposite to $\vec{E}$ because the electron is negative."),
    ],
  },
  "1-3": {
    "unit": "Unit 1 -- Electric Charge, Force, and Field",
    "title": "1.3 Charges in Uniform Fields",
    "problems": [
      (r"An electron enters a region of uniform field $E = 500$~N/C with speed $2.0\times10^{6}$~m/s perpendicular to the field. How far has it been deflected sideways after travelling $4.0$~cm along its original direction? Ignore gravity.",
       r"Time in the field: $t = \dfrac{0.040}{2.0\times10^{6}} = 2.0\times10^{-8}$~s. Acceleration: $a = \dfrac{eE}{m_e} = 8.8\times10^{13}$~m/s$^2$. Deflection: $y = \tfrac12 a t^2 = \tfrac12(8.8\times10^{13})(2.0\times10^{-8})^2 = 1.8\times10^{-2}$~m $= 1.8$~cm."),
      (r"An electric dipole with dipole moment $p = 6.0\times10^{-30}$~C$\cdot$m sits in a uniform field $E = 1.0\times10^{5}$~N/C, making a $30^\circ$ angle with the field. Find the torque on the dipole and its potential energy.",
       r"$\tau = pE\sin\theta = (6.0\times10^{-30})(1.0\times10^{5})\sin 30^\circ = 3.0\times10^{-25}$~N$\cdot$m. $U = -pE\cos\theta = -5.2\times10^{-25}$~J."),
    ],
  },
  "2-1": {
    "unit": "Unit 2 -- Gauss's Law",
    "title": "2.1 Fields of Continuous Charge Distributions",
    "problems": [
      (r"A thin rod of length $L$ carries total charge $Q$ spread uniformly along it. Find the electric field at a point on the rod's axis a distance $a$ from the nearer end.",
       r"Let $\lambda = Q/L$ and put the near end at $x=0$ with the field point at $x=-a$. A slice $dq = \lambda\,dx$ at position $x$ is a distance $a + x$ away, so $dE = \dfrac{k\lambda\,dx}{(a+x)^2}$. Integrating: $E = k\lambda\displaystyle\int_0^{L}\frac{dx}{(a+x)^2} = k\lambda\left[\frac{1}{a} - \frac{1}{a+L}\right] = \frac{kQ}{a(a+L)}$, pointing away from the rod."),
      (r"A ring of radius $R$ carries charge $Q$ uniformly. Find the field on the axis a distance $z$ from the centre, and the value of $z$ where it is largest.",
       r"By symmetry only the axial component survives: $E_z = \dfrac{kQz}{(z^2+R^2)^{3/2}}$. Setting $dE_z/dz = 0$ gives $z^2 + R^2 - 3z^2 = 0$, so the maximum is at $z = R/\sqrt{2}$."),
    ],
  },
  "2-2": {
    "unit": "Unit 2 -- Gauss's Law",
    "title": "2.2 Electric Flux and Gauss's Law: Spherical Symmetry",
    "problems": [
      (r"A closed surface encloses point charges $q_1 = +2.0$~nC and $q_2 = -5.0$~nC (and a third charge of $+7.0$~nC sits outside). Find the net electric flux through the surface.",
       r"Only enclosed charge counts: $\Phi_E = \dfrac{q_{\text{enc}}}{\varepsilon_0} = \dfrac{-3.0\times10^{-9}}{8.85\times10^{-12}} = -3.4\times10^{2}\ \text{N}\cdot\text{m}^2/\text{C}$."),
      (r"An insulating sphere of radius $R$ carries charge $Q$ spread uniformly through its volume. Use Gauss's law to find $E(r)$ for $r<R$ and for $r>R$.",
       r"Gaussian sphere of radius $r$: $E\,(4\pi r^2) = q_{\text{enc}}/\varepsilon_0$. Outside, $q_{\text{enc}} = Q$ so $E = \dfrac{kQ}{r^2}$. Inside, $q_{\text{enc}} = Q\,\dfrac{r^3}{R^3}$ so $E = \dfrac{kQr}{R^3}$. The two agree at $r = R$."),
    ],
  },
  "2-3": {
    "unit": "Unit 2 -- Gauss's Law",
    "title": "2.3 Gauss's Law: Cylindrical and Planar Symmetry",
    "problems": [
      (r"An infinitely long line of charge has linear density $\lambda = 2.0\,\mu\text{C/m}$. Find $E$ at a perpendicular distance of $0.050$~m.",
       r"Gaussian cylinder of radius $r$ and length $\ell$: $E\,(2\pi r\ell) = \lambda\ell/\varepsilon_0$, so $E = \dfrac{\lambda}{2\pi\varepsilon_0 r} = \dfrac{2k\lambda}{r} = \dfrac{2(8.99\times10^{9})(2.0\times10^{-6})}{0.050} = 7.2\times10^{5}\ \text{N/C}$."),
      (r"A large flat insulating sheet carries surface charge density $\sigma = 1.0\times10^{-6}$~C/m$^2$. Find the field near the sheet.",
       r"Gaussian pillbox with faces of area $A$ on both sides: $2EA = \sigma A/\varepsilon_0$, so $E = \dfrac{\sigma}{2\varepsilon_0} = \dfrac{1.0\times10^{-6}}{2(8.85\times10^{-12})} = 5.6\times10^{4}\ \text{N/C}$, perpendicular to the sheet."),
      (r"Explain why the field just outside a charged conductor in electrostatic equilibrium is $E = \sigma/\varepsilon_0$, twice the value for the thin sheet above.",
       r"Inside a conductor in equilibrium $E = 0$, so a pillbox straddling the surface has flux only through its outer face: $EA = \sigma A/\varepsilon_0$, giving $E = \sigma/\varepsilon_0$. The thin sheet has flux through both faces, which halves the result."),
    ],
  },
}

# Reviews reuse problems from the unit's lessons (first problem of each).
REVIEWS = {
  "unit-1-review": ("Unit 1 -- Electric Charge, Force, and Field", "Unit 1 Review", ["1-1", "1-2", "1-3"]),
  "unit-2-review": ("Unit 2 -- Gauss's Law", "Unit 2 Review", ["2-1", "2-2", "2-3"]),
}

# ---------------------------------------------------------------------------
# LaTeX template
# ---------------------------------------------------------------------------
PREAMBLE = r"""\documentclass[11pt,letterpaper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{fancyhdr}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage[framemethod=tikz]{mdframed}
\usepackage[hidelinks]{hyperref}
\pagestyle{fancy}
\fancyhf{}
\lhead{\small SITE}
\rhead{\small SUBJECT}
\cfoot{\small\thepage}
\renewcommand{\headrulewidth}{0.4pt}
\setlength{\parindent}{0pt}
\definecolor{keybg}{RGB}{240,244,250}
\newmdenv[backgroundcolor=keybg,linewidth=0pt,innerleftmargin=8pt,innerrightmargin=8pt,innertopmargin=6pt,innerbottommargin=6pt,skipabove=6pt]{answer}
\begin{document}
"""

def header(unit, title, kind):
    """The block at the top of every page: unit, lesson title, and either a
    Name/Date line (worksheet) or an 'Answer key' label (solutions)."""
    line = (r"Name: \rule{2.4in}{0.4pt} \hfill Date: \rule{1.4in}{0.4pt}"
            if kind == "Worksheet" else r"\textbf{Answer key}")
    return (r"{\small\textsc{" + unit + r"}}\\[2pt]"
            r"{\Large\bfseries " + title + r"}\\[8pt]" + line + r"\\[4pt]\hrule\vspace{10pt}")

PLACEHOLDER_NOTE = (r"{\small\itshape Placeholder worksheet for the site prototype. "
                    r"Free for classroom use.}\vspace{6pt}")

def problems_tex(problems, with_solutions):
    out = r"\begin{enumerate}[leftmargin=*,itemsep=10pt]" + "\n"
    for stmt, sol in problems:
        out += r"\item " + stmt + "\n"
        if with_solutions:
            out += r"\begin{answer}" + sol + r"\end{answer}" + "\n"
        else:
            out += r"\vspace{2.2in}" + "\n"       # blank work space
    out += r"\end{enumerate}" + "\n"
    return out

def build(name, unit, title, problems):
    """Writes name-worksheet.pdf and name-solutions.pdf."""
    for kind, suffix in (("Worksheet", "worksheet"), ("Solutions", "solutions")):
        body = PREAMBLE.replace("SITE", SITE).replace("SUBJECT", SUBJECT)
        body += header(unit, title, kind) + PLACEHOLDER_NOTE + "\n"
        body += problems_tex(problems, with_solutions=(kind == "Solutions"))
        body += r"\end{document}"
        compile_tex(f"{name}-{suffix}", body)

def compile_tex(basename, tex):
    pathlib.Path("tex").mkdir(exist_ok=True)
    pathlib.Path("pdfs").mkdir(exist_ok=True)
    src = pathlib.Path("tex") / f"{basename}.tex"
    src.write_text(tex)
    subprocess.run(["pdflatex", "-interaction=batchmode", "-halt-on-error",
                    "-output-directory", "tex", str(src)],
                   check=True, stdout=subprocess.DEVNULL)
    os.replace(pathlib.Path("tex") / f"{basename}.pdf", pathlib.Path("pdfs") / f"{basename}.pdf")
    print("built", basename + ".pdf")

# --- lessons ---------------------------------------------------------------
for key, L in LESSONS.items():
    build(key, L["unit"], L["title"], L["problems"])

# --- reviews ---------------------------------------------------------------
for key, (unit, title, lesson_keys) in REVIEWS.items():
    probs = [LESSONS[k]["problems"][0] for k in lesson_keys]
    # Reviews are named unit-1-review.pdf / unit-1-review-solutions.pdf
    for kind, fname in (("Worksheet", key), ("Solutions", key + "-solutions")):
        body = PREAMBLE.replace("SITE", SITE).replace("SUBJECT", SUBJECT)
        body += header(unit, title, kind) + PLACEHOLDER_NOTE + "\n"
        body += problems_tex(probs, with_solutions=(kind == "Solutions"))
        body += r"\end{document}"
        compile_tex(fname, body)

# --- unit 1 notes ------------------------------------------------------------
notes = PREAMBLE.replace("SITE", SITE).replace("SUBJECT", SUBJECT)
notes += header("Unit 1 -- Electric Charge, Force, and Field", "Unit 1 Notes", "Summary")
notes += PLACEHOLDER_NOTE + r"""
\section*{Key ideas}
\begin{itemize}[itemsep=6pt]
  \item Charge is quantised ($q = ne$, $e = 1.60\times10^{-19}$~C) and conserved.
  \item \textbf{Coulomb's law:} $\vec{F} = k\dfrac{q_1 q_2}{r^2}\,\hat{r}$, with $k = \dfrac{1}{4\pi\varepsilon_0} = 8.99\times10^{9}$~N$\cdot$m$^2$/C$^2$.
  \item \textbf{Superposition:} the net force (or field) is the vector sum of the individual contributions.
  \item \textbf{Electric field:} $\vec{E} = \vec{F}/q_0$; for a point charge $E = k\dfrac{|q|}{r^2}$, pointing away from positive charge and toward negative charge.
  \item A charge in a field feels $\vec{F} = q\vec{E}$; in a \emph{uniform} field the motion is projectile-like with $a = qE/m$.
  \item \textbf{Dipole} in a uniform field: $\tau = pE\sin\theta$, $U = -\vec{p}\cdot\vec{E}$.
\end{itemize}
\section*{Constants}
$\varepsilon_0 = 8.85\times10^{-12}$~C$^2$/(N$\cdot$m$^2$) \qquad $m_e = 9.11\times10^{-31}$~kg \qquad $m_p = 1.67\times10^{-27}$~kg
\end{document}"""
compile_tex("unit-1-notes", notes)
