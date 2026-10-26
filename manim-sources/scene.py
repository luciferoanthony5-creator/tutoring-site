"""
scene.py - the home-page background loop, drawn with manim (https://www.manim.community).

One scene, 19.2 s long, that loops with no visible seam:
  - particles entering a magnetic field (B into the page), every third one making a full half-circle
  - a swinging pendulum (the exact large-angle solution, not the small-angle approximation)
The two cross-fade into each other and back again.

Everything is a function of one clock T (a ValueTracker), so the loop is exact:
  - particles repeat every 3 spawns = 4.8 s, and 19.2 s = 4 x 4.8 s
  - the pendulum period is 3.2 s, and 19.2 s = 6 x 3.2 s

Build the video files with:  python3 manim-sources/render.py
"""
import random                                   # seeded, so every render looks the same

import numpy as np                              # arrays and maths
from manim import (BLACK, Circle, Dot, DashedVMobject, Arc, Line, Rectangle, ValueTracker,
                   VGroup, Scene, always_redraw, linear, PI, ORIGIN)
from scipy.special import ellipj, ellipk        # exact pendulum solution

LOOP = 19.2                                     # seconds in one loop
RED, BLUE = "#FF7A55", "#7C9BFF"                # positive / negative charge (the site's dark-mode colours)
GREY = "#8C90B8"                                # field symbols
WHITE = "#ECEEFA"                               # pendulum (neutral, so red and blue keep meaning "charge")


def smooth(x):
    """0 -> 1 with soft ends (smoothstep); used for the cross-fade."""
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def magnet_alpha(T):
    """How visible the magnet scene is at time T: 1 around T=4.8, 0 around T=14.4, 0.5 at the loop seam."""
    return smooth((np.cos(2 * PI * (T - 4.8) / LOOP) + 0.35) / 0.7)


# ---------------------------------------------------------------- magnetic field
FIELD_X0 = 0.5                                  # field starts here (right of centre, so the left stays calm behind the text)
SPEED = 3.5                                     # particle speed, scene units per second
START_X = -7.6                                  # particles start just off the left edge
SPAWN = 1.6                                     # seconds between particles


def make_particles():
    """Twelve particles per loop. Every third (k = 2, 5, 8, 11) is a tight half-circle that comes back out."""
    rng = random.Random(11)                     # fixed seed = same loop every render
    out = []
    for k in range(int(LOOP / SPAWN)):
        s = 1 if k % 2 == 0 else -1             # +1 positive (curves up), -1 negative (curves down)
        half = (k % 3 == 2)                     # the guaranteed half-circle
        if half:
            r = rng.uniform(1.0, 1.4)
            # keep the whole circle inside y = -3.3 ... 3.3
            y0 = rng.uniform(-3.3, 3.3 - 2 * r) if s > 0 else rng.uniform(-3.3 + 2 * r, 3.3)
        else:
            r = rng.uniform(4.2, 7.0)           # big radius: a gentle bend, leaves the screen
            y0 = rng.uniform(-2.4, 2.4)
        out.append(dict(k=k, s=s, r=r, y0=y0, half=half))
    for p in out:                               # how long each one stays on screen
        u = 0.0
        while u < 14:
            u += 0.02
            x, y = particle_pos(p, u)
            if u > 2 and (abs(x) > 7.6 or abs(y) > 4.4):
                break
        p["life"] = u
    return out


def particle_pos(p, u):
    """Position of particle p, u seconds after it was launched."""
    s, r, y0 = p["s"], p["r"], p["y0"]
    u0 = (FIELD_X0 - START_X) / SPEED           # time to reach the field
    if u <= u0:
        return START_X + SPEED * u, y0          # straight line in
    phi = SPEED * (u - u0) / r                  # angle turned so far
    if p["half"] and phi > PI:                  # left the field: straight line out, going left
        return FIELD_X0 - SPEED * (u - u0 - PI * r / SPEED), y0 + 2 * s * r
    return FIELD_X0 + r * np.sin(phi), y0 + s * r * (1 - np.cos(phi))   # circular arc in the field


PARTICLES = make_particles()


def build_magnet(T):
    a = magnet_alpha(T)
    g = VGroup()
    if a < 0.004:
        return g
    for p in PARTICLES:
        u = (T - p["k"] * SPAWN) % LOOP         # time since this particle launched (wraps around the loop)
        if u > p["life"]:
            continue
        col = RED if p["s"] > 0 else BLUE
        for j in range(14):                     # fading trail: 14 short segments, newest first
            u1, u2 = u - j * 0.07, u - (j + 1) * 0.07
            if u2 < 0:
                break
            x1, y1 = particle_pos(p, u1)
            x2, y2 = particle_pos(p, u2)
            g.add(Line([x1, y1, 0], [x2, y2, 0], color=col, stroke_width=3,
                       stroke_opacity=a * 0.75 * (1 - j / 14)))
        x, y = particle_pos(p, u)
        g.add(Dot([x, y, 0], radius=0.22, color=col, fill_opacity=a * 0.14, stroke_width=0))   # glow
        g.add(Dot([x, y, 0], radius=0.09, color=col, fill_opacity=a, stroke_width=0))          # the particle
    return g


def make_field():
    """The shaded field region with a grid of x marks (x = pointing into the page)."""
    g = VGroup()
    g.add(Rectangle(width=7.4, height=7.0, stroke_width=1).move_to([FIELD_X0 + 3.7, 0, 0]))
    marks = VGroup()
    for x in np.arange(FIELD_X0 + 0.7, 7.6, 0.95):
        for y in np.arange(-3.0, 3.1, 0.95):
            d = 0.1
            marks.add(Line([x - d, y - d, 0], [x + d, y + d, 0], stroke_width=1.5),
                      Line([x - d, y + d, 0], [x + d, y - d, 0], stroke_width=1.5))
    g.add(marks)
    return g


# ---------------------------------------------------------------- pendulum
PIVOT = np.array([3.4, 3.0, 0.0])               # where it hangs from
ROD = 4.4                                       # length in scene units
THETA0 = np.radians(50)                         # release angle
PERIOD = 3.2                                    # seconds per full swing
_k = np.sin(THETA0 / 2)
_K = ellipk(_k ** 2)                            # quarter-period integral
_w0 = 4 * _K / PERIOD                           # sets the exact period


def theta(t):
    """Exact pendulum angle: theta'' = -(g/L) sin(theta), released from rest at THETA0."""
    sn, cn, dn, _ = ellipj(_w0 * t, _k ** 2)
    return 2 * np.arcsin(_k * cn / dn)


def bob(t):
    th = theta(t)
    return PIVOT + ROD * np.array([np.sin(th), -np.cos(th), 0.0])


def build_pendulum(T):
    a = 1 - magnet_alpha(T)
    g = VGroup()
    if a < 0.004:
        return g
    for j in range(16):                         # fading trail along the arc
        p1, p2 = bob(T - j * 0.06), bob(T - (j + 1) * 0.06)
        g.add(Line(p1, p2, color=WHITE, stroke_width=3, stroke_opacity=a * 0.5 * (1 - j / 16)))
    b = bob(T)
    g.add(Line(PIVOT, b, color=WHITE, stroke_width=2, stroke_opacity=a * 0.7))                   # rod
    g.add(Dot(b, radius=0.55, color=WHITE, fill_opacity=a * 0.06, stroke_width=0))               # soft halo
    g.add(Dot(b, radius=0.3, color=WHITE, fill_opacity=a * 0.12, stroke_width=0))
    g.add(Dot(b, radius=0.2, color=WHITE, fill_opacity=a * 0.95, stroke_width=0))                # the bob
    g.add(Line(PIVOT + [-0.35, 0.12, 0], PIVOT + [0.35, 0.12, 0], color=WHITE, stroke_width=3, stroke_opacity=a * 0.6))  # support
    g.add(Dot(PIVOT, radius=0.06, color=WHITE, fill_opacity=a, stroke_width=0))                  # pivot
    return g


def make_guide():
    """Faint dashed arc the bob travels along."""
    arc = Arc(radius=ROD, start_angle=-PI / 2 - THETA0, angle=2 * THETA0, arc_center=PIVOT,
              color=WHITE, stroke_width=1.5)
    return DashedVMobject(arc, num_dashes=30)


# ---------------------------------------------------------------- the scene
class Loop(Scene):
    def construct(self):
        self.camera.background_color = BLACK    # true black, to match the page
        T = ValueTracker(0)                     # the clock; everything above is a function of it

        field = make_field()
        guide = make_guide()

        def fade_static(m):                     # keep the static shapes in step with the cross-fade
            a = magnet_alpha(T.get_value())
            field[0].set_stroke(GREY, opacity=0.35 * a).set_fill(BLUE, opacity=0.035 * a)
            for line in field[1]:
                line.set_stroke(GREY, opacity=0.32 * a)
        field.add_updater(fade_static)
        guide.add_updater(lambda m: m.set_stroke(WHITE, opacity=0.18 * (1 - magnet_alpha(T.get_value()))))

        self.add(field, guide)
        self.add(always_redraw(lambda: build_magnet(T.get_value())))     # redrawn every frame from the clock
        self.add(always_redraw(lambda: build_pendulum(T.get_value())))
        self.play(T.animate.set_value(LOOP), run_time=LOOP, rate_func=linear)
