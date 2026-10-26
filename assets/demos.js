/* =====================================================================
   demos.js  -  all the physics demos on the site.

   A page picks a demo with an attribute on a <canvas>:
     <canvas data-demo="field">       interactive electric-field demo
     <canvas data-demo="projectile">  interactive projectile launcher
     <canvas data-demo="background">  non-interactive loop of three demos,
                                      used behind the home page

   Field demo: two charges, field lines leave the positive one and end on
   the negative one (or run off the canvas, which stands in for infinity).
   Drag a charge to move it; double-click / double-tap flips its sign.
   Keyboard: press 1 or 2 to pick a charge, arrow keys to move it, Enter
   to flip its sign.

   Projectile demo: press and drag to aim, release to launch. The dots are
   0.25 s apart, so equal spacing sideways shows constant horizontal speed.

   The home-page background loops three scenes: field lines, projectiles,
   and charges entering and leaving a magnetic field.
   ===================================================================== */

(() => {                                           // wraps everything so names stay private
  const canvases = document.querySelectorAll("canvas[data-demo]");  // every demo canvas on this page
  if (!canvases.length) return;                    // none: do nothing
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches; // true if the visitor asked for less motion
  const G = 9.8;                                   // gravity in m/s^2
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)); // keeps v between lo and hi

  /* Read a colour from the CSS tokens, so dark mode is picked up automatically. */
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* Match the canvas to its on-screen size (sharper on retina screens, capped by maxDpr).
     Returns the size in CSS pixels. */
  function fit(canvas, ctx, maxDpr) {
    const r = canvas.getBoundingClientRect();      // size on screen
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.round(r.width * dpr);      // drawing surface size
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);        // draw in CSS pixels
    return { w: r.width, h: r.height };
  }

  /* ================= FIELD SCENE ================= */
  function fieldScene({ lines: count = 18, step = 3, maxSteps = 1500 } = {}) {
    const R = 14;                                  // charge radius in pixels
    const s = {
      w: 0, h: 0, R,
      charges: [{ x: 0.32, y: 0.5, q: 1 }, { x: 0.68, y: 0.5, q: -1 }], // x, y are fractions of the canvas; q is the sign
      scale: [1, 1],                               // size multiplier per charge (press and flip animation)
      lines: [],                                   // traced field lines
    };
    const pos = (i) => ({ x: s.charges[i].x * s.w, y: s.charges[i].y * s.h }); // pixel position of charge i

    /* Unit vector along the field at (x, y), times `sign`. */
    function dir(x, y, sign) {
      let ex = 0, ey = 0;                          // running total of the field
      for (let i = 0; i < s.charges.length; i++) {
        const p = pos(i), dx = x - p.x, dy = y - p.y;
        const d2 = dx * dx + dy * dy + 1;          // +1 avoids dividing by zero
        const d3 = d2 * Math.sqrt(d2);             // distance cubed
        ex += (s.charges[i].q * dx) / d3;          // each charge adds q * r / r^3
        ey += (s.charges[i].q * dy) / d3;
      }
      const m = Math.hypot(ex, ey) || 1;
      return { x: (sign * ex) / m, y: (sign * ey) / m };
    }

    /* Trace every field line from every charge. */
    s.trace = () => {
      s.lines = [];
      s.charges.forEach((c, i) => {
        const sign = Math.sign(c.q);               // +1: follow the field; -1: follow it backwards
        const start = pos(i);
        for (let k = 0; k < count; k++) {
          const a = (2 * Math.PI * k) / count + 0.3; // angle this line leaves the charge
          let x = start.x + Math.cos(a) * R, y = start.y + Math.sin(a) * R;
          const pts = [[x, y]];
          let ended = false;                       // true if the line finishes on a charge of the other sign
          for (let n = 0; n < maxSteps; n++) {
            const d1 = dir(x, y, sign);
            const dm = dir(x + d1.x * step * 0.5, y + d1.y * step * 0.5, sign); // look half a step ahead
            x += dm.x * step; y += dm.y * step;
            pts.push([x, y]);
            if (x < -20 || x > s.w + 20 || y < -20 || y > s.h + 20) break;   // left the canvas
            const hit = s.charges.some((o, j) => {  // reached a charge of the other sign?
              if (Math.sign(o.q) === sign) return false;
              const p = pos(j);
              return Math.hypot(x - p.x, y - p.y) < R;
            });
            if (hit) { ended = true; break; }
          }
          if (ended && sign < 0) continue;         // a line from - landing on + repeats one drawn from +
          s.lines.push({ pts, sign });
        }
      });
    };

    s.setSize = (w, h) => { s.w = w; s.h = h; s.trace(); };

    /* Slow drift for the background loop. t is seconds. */
    s.ambient = (t) => {
      s.charges[0].x = 0.62 + 0.04 * Math.sin(t * 0.3);        // positive charge wanders gently
      s.charges[0].y = 0.45 + 0.06 * Math.cos(t * 0.23);
      s.charges[1].x = 0.84 + 0.04 * Math.sin(t * 0.27 + 1);   // negative charge likewise
      s.charges[1].y = 0.55 + 0.06 * Math.cos(t * 0.31 + 2);
      s.trace();
    };

    /* Small arrowhead at point p, pointing along (tx, ty). */
    const arrow = (ctx, p, tx, ty) => {
      const a = 6.5;
      ctx.beginPath();
      ctx.moveTo(p[0] + tx * a, p[1] + ty * a);                                  // tip
      ctx.lineTo(p[0] - tx * a - ty * a * 0.6, p[1] - ty * a + tx * a * 0.6);    // back corner
      ctx.lineTo(p[0] - tx * a + ty * a * 0.6, p[1] - ty * a - tx * a * 0.6);    // other back corner
      ctx.closePath();
      ctx.fill();
    };

    /* progress 0 to 1 = how much of each line is drawn; selected = charge with the keyboard ring (-1 for none). */
    s.draw = (ctx, progress = 1, selected = -1) => {
      ctx.strokeStyle = css("--grid"); ctx.fillStyle = css("--grid"); ctx.lineWidth = 1.3;
      for (const line of s.lines) {
        const n = Math.max(2, Math.floor(line.pts.length * progress)); // points to show
        ctx.beginPath();
        ctx.moveTo(line.pts[0][0], line.pts[0][1]);
        for (let i = 1; i < n; i++) ctx.lineTo(line.pts[i][0], line.pts[i][1]);
        ctx.stroke();
        const mid = Math.floor(line.pts.length * 0.5);   // arrowhead halfway along
        if (mid > 1 && n > mid) {
          const a = line.pts[mid - 1], b = line.pts[mid + 1] || line.pts[mid];
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          arrow(ctx, line.pts[mid], ((b[0] - a[0]) / len) * line.sign, ((b[1] - a[1]) / len) * line.sign);
        }
      }
      s.charges.forEach((c, i) => {                      // charges on top
        const p = pos(i), k = s.scale[i], bar = 5.5 * k;
        ctx.beginPath(); ctx.arc(p.x, p.y, R * k, 0, 2 * Math.PI);
        ctx.fillStyle = css(c.q > 0 ? "--pos" : "--neg");   // red = positive, blue = negative
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2.2;   // white + or - sign
        ctx.beginPath();
        ctx.moveTo(p.x - bar, p.y); ctx.lineTo(p.x + bar, p.y);                   // horizontal bar
        if (c.q > 0) { ctx.moveTo(p.x, p.y - bar); ctx.lineTo(p.x, p.y + bar); }  // vertical bar (plus only)
        ctx.stroke();
        if (i === selected) {                               // ring shows the keyboard choice
          ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p.x, p.y, R + 5, 0, 2 * Math.PI); ctx.stroke();
        }
      });
    };
    return s;
  }

  /* ================= PROJECTILE SCENE ================= */
  /* mode "play": one shot at a time, aimed by the visitor. mode "ambient": random shots on a timer. */
  function projectileScene(mode) {
    const ballR = mode === "play" ? 7 : 6;         // ball radius in pixels
    const s = {
      w: 0, h: 0, ox: 0, gy: 0, ppm: 1, k: 1,      // layout numbers, set by setSize
      time: 0, shots: [], nextSpawn: 0,
      aim: { v: 24, a: (55 * Math.PI) / 180 },     // launch speed (m/s) and angle (radians)
      showAim: mode === "play",
      aimAlpha: 1,                                 // how bright the launch arrow is (dims while a ball flies)
    };

    s.setSize = (w, h) => {
      s.w = w; s.h = h;
      if (mode === "play") { s.ppm = w / 120; s.ox = w * 0.07; s.gy = h * 0.88; }              // 120 m across
      else { s.ppm = Math.max(w * 0.6, h * 1.1) / 100; s.ox = w * 0.36; s.gy = h * 0.9; }     // launch from the clear right-hand side, bigger on tall phones
      s.k = s.ppm * 1.1;                           // pixels of arrow per m/s of speed
    };

    const flightTime = (sh) => (2 * sh.v * Math.sin(sh.a)) / G;   // seconds until the ball lands
    const age = (sh) => s.time - sh.t0;                           // seconds since launch

    /* Start a shot. instant = true jumps straight to the finished flight (reduced motion). */
    s.launch = (v, a, instant) => {
      const sh = { v, a, t0: s.time };
      if (instant) sh.t0 = s.time - flightTime(sh) - 0.001;
      s.shots.push(sh);
    };

    s.flying = () => s.shots.some((sh) => age(sh) < flightTime(sh));          // is a ball still in the air?
    const aimTarget = () => (s.flying() ? 0.3 : 1);                           // arrow dims while a ball flies
    s.active = () => s.flying() || Math.abs(s.aimAlpha - aimTarget()) > 0.01; // does the loop still need to run?

    /* Advance time by dt seconds; in ambient mode, also fire and retire shots. */
    s.step = (dt) => {
      s.time += dt;
      s.aimAlpha = reduceMotion ? aimTarget() : s.aimAlpha + (aimTarget() - s.aimAlpha) * Math.min(1, dt * 14); // ease the arrow's brightness
      if (mode !== "ambient") return;
      if (s.time >= s.nextSpawn) {                 // time for another shot
        s.launch(22 + Math.random() * 12, ((35 + Math.random() * 35) * Math.PI) / 180);
        s.nextSpawn = s.time + 0.9 + Math.random() * 0.6;
      }
      s.shots = s.shots.filter((sh) => age(sh) < flightTime(sh) + 3);  // drop shots once faded out
    };

    /* Pixel position at time t after launch. */
    const at = (sh, t) => ({
      x: s.ox + sh.v * Math.cos(sh.a) * t * s.ppm,
      y: s.gy - ballR - (sh.v * Math.sin(sh.a) * t - 0.5 * G * t * t) * s.ppm,
    });

    /* Draw one flight: a line up to time tEnd, a dot every 0.25 s, and the ball. */
    function path(ctx, sh, tEnd, alpha) {
      const before = ctx.globalAlpha;              // remember the alpha we were given
      ctx.globalAlpha = before * alpha;
      const red = css("--pos");
      ctx.strokeStyle = red; ctx.fillStyle = red; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let t = 0; t <= tEnd; t += 0.04) {
        const p = at(sh, t);
        if (t === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      const e = at(sh, tEnd); ctx.lineTo(e.x, e.y);
      ctx.stroke();
      for (let t = 0.25; t <= tEnd; t += 0.25) {   // evenly timed dots: equal spacing in x shows constant horizontal speed
        const p = at(sh, t);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(e.x, e.y, ballR, 0, 2 * Math.PI); ctx.fill();   // the ball itself
      ctx.globalAlpha = before;                    // put the alpha back exactly as it was
    }

    s.draw = (ctx) => {
      ctx.lineCap = "round";
      ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1;   // the ground
      ctx.beginPath(); ctx.moveTo(0, s.gy + 0.5); ctx.lineTo(s.w, s.gy + 0.5); ctx.stroke();
      for (const sh of s.shots) {
        const t = age(sh), T = flightTime(sh);
        const fadeIn = mode === "ambient" ? Math.min(1, t / 0.25) : 1;          // ambient shots fade in instead of popping
        const fadeOut = mode === "ambient" && t > T ? Math.max(0, 1 - (t - T) / 3) : 1;  // and fade out after landing
        path(ctx, sh, Math.min(t, T), fadeIn * fadeOut);                        // the ball stops at the ground
      }
      if (s.showAim) {                             // the launch arrow
        const ink = css("--ink");
        const tipX = s.ox + Math.cos(s.aim.a) * s.aim.v * s.k, tipY = s.gy - Math.sin(s.aim.a) * s.aim.v * s.k;
        const before = ctx.globalAlpha;
        ctx.globalAlpha = before * s.aimAlpha;
        ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s.ox, s.gy); ctx.lineTo(tipX, tipY); ctx.stroke();
        const tx = Math.cos(s.aim.a), ty = -Math.sin(s.aim.a);     // arrow direction on screen
        ctx.beginPath();                           // arrowhead
        ctx.moveTo(tipX + tx * 10, tipY + ty * 10);
        ctx.lineTo(tipX - ty * 6, tipY + tx * 6);
        ctx.lineTo(tipX + ty * 6, tipY - tx * 6);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(s.ox, s.gy, 4, 0, 2 * Math.PI); ctx.fill();   // launcher
        ctx.globalAlpha = before;
      }
    };
    return s;
  }

  /* ================= MAGNETIC FIELD SCENE (home background only) ================= */
  /* A vertical band holds a magnetic field pointing into the screen (the x marks). Charges fly in from the
     left: a positive charge bends up, a negative one bends down, on a circle of radius r = v / w. Small
     circles turn back out the left side; big ones leave on the right. Outside the band they fly straight. */
  function magnetScene() {
    const W = 1.6;                                 // turning rate in radians per second (the same for every speed)
    const s = { w: 0, h: 0, x0: 0, x1: 0, time: 0, parts: [], nextSpawn: 0 };

    s.setSize = (w, h) => {
      s.w = w; s.h = h;
      const bw = Math.min(w * 0.3, 420);           // band width
      s.x0 = w * 0.5; s.x1 = s.x0 + bw;            // left and right edges of the band
    };

    s.step = (dt) => {
      s.time += dt;
      if (s.time >= s.nextSpawn && s.parts.filter((p) => !p.outAt).length < 4) {   // at most four charges flying
        const bw = s.x1 - s.x0;
        const r = bw * (0.4 + Math.random() * 1.4);      // radius of the circle it will follow inside the band
        const q = Math.random() < 0.5 ? 1 : -1;          // sign of the charge
        s.parts.push({ x: s.x0 - Math.min(s.w * 0.2, 260), y: s.h * (0.42 + Math.random() * 0.2), speed: W * r, ang: 0, q, trail: [], t0: s.time, outAt: 0 });
        s.nextSpawn = s.time + 1.3 + Math.random() * 0.8;
      }
      for (const p of s.parts) {
        if (p.outAt) continue;                     // already left the screen: only fading
        const n = Math.ceil(dt / 0.008), h = dt / n;   // tiny sub-steps keep the circle accurate
        for (let i = 0; i < n; i++) {
          if (p.x >= s.x0 && p.x <= s.x1) p.ang += (p.q > 0 ? -1 : 1) * W * h;   // inside the field: the direction turns
          p.x += Math.cos(p.ang) * p.speed * h;
          p.y += Math.sin(p.ang) * p.speed * h;
        }
        p.trail.push([p.x, p.y]);
        if (p.x < -30 || p.x > s.w + 30 || p.y < -30 || p.y > s.h + 30) p.outAt = s.time;
      }
      s.parts = s.parts.filter((p) => !p.outAt || s.time - p.outAt < 2);   // drop faded charges
    };

    s.draw = (ctx) => {
      const grid = css("--grid");
      const base = ctx.globalAlpha;                      // the alpha this scene was given (it changes during a crossfade)
      ctx.fillStyle = grid; ctx.globalAlpha = base * 0.12;   // the band's faint tint
      ctx.fillRect(s.x0, 0, s.x1 - s.x0, s.h);
      ctx.globalAlpha = base;
      ctx.strokeStyle = grid; ctx.lineWidth = 1.2;
      ctx.beginPath();                                   // x marks = field pointing into the screen
      for (let x = s.x0 + 19; x < s.x1; x += 38) {
        for (let y = 19; y < s.h; y += 38) {
          ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4);
          ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4);
        }
      }
      ctx.moveTo(s.x0, 0); ctx.lineTo(s.x0, s.h);        // band edges
      ctx.moveTo(s.x1, 0); ctx.lineTo(s.x1, s.h);
      ctx.stroke();
      for (const p of s.parts) {
        const before = ctx.globalAlpha;
        const fadeIn = Math.min(1, (s.time - p.t0) / 0.3);
        const fadeOut = p.outAt ? Math.max(0, 1 - (s.time - p.outAt) / 2) : 1;
        ctx.globalAlpha = before * fadeIn * fadeOut;
        const color = css(p.q > 0 ? "--pos" : "--neg");  // red = positive, blue = negative
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.8; ctx.lineCap = "round";
        ctx.beginPath();
        p.trail.forEach((t, i) => { if (i === 0) ctx.moveTo(t[0], t[1]); else ctx.lineTo(t[0], t[1]); });
        ctx.stroke();
        if (!p.outAt) { ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI); ctx.fill(); }
        ctx.globalAlpha = before;
      }
    };
    return s;
  }

  /* ================= INTERACTIVE FIELD ================= */
  function mountField(canvas) {
    const ctx = canvas.getContext("2d");
    const s = fieldScene();
    let progress = 1, selected = 0, dragging = -1, touched = false;
    let lastTap = { i: -1, t: 0 };                 // remembers the last press, to spot a double-tap
    const tweens = [0, 0];                         // animation-frame ids, one per charge

    const draw = () => {
      ctx.clearRect(0, 0, s.w, s.h);
      s.draw(ctx, progress, document.activeElement === canvas ? selected : -1);
    };

    /* Ease charge i's size to `to` over `ms` milliseconds (fast start, soft landing). */
    function tween(i, to, ms) {
      if (reduceMotion) { s.scale[i] = to; draw(); return; }
      cancelAnimationFrame(tweens[i]);
      const from = s.scale[i], t0 = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        s.scale[i] = from + (to - from) * (1 - Math.pow(1 - t, 3));
        draw();
        if (t < 1) tweens[i] = requestAnimationFrame(frame);
      };
      tweens[i] = requestAnimationFrame(frame);
    }

    /* One-time reveal: the lines grow out of the charges. */
    function reveal() {
      if (reduceMotion) { progress = 1; draw(); return; }
      const t0 = performance.now();
      const frame = (now) => {
        if (touched) return;                       // visitor grabbed a charge: stop the intro
        const t = Math.min(1, (now - t0) / 1200);
        progress = 1 - Math.pow(1 - t, 3);
        draw();
        if (t < 1) requestAnimationFrame(frame);
      };
      progress = 0;
      requestAnimationFrame(frame);
    }

    const update = () => { touched = true; progress = 1; s.trace(); draw(); };

    function hit(e) {                              // which charge is under the pointer? (-1 = none)
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      let best = -1, bestD = s.R + 12;             // a little extra for fingers
      s.charges.forEach((c, i) => {
        const d = Math.hypot(x - c.x * s.w, y - c.y * s.h);
        if (d < bestD) { best = i; bestD = d; }
      });
      return best;
    }
    function moveTo(i, e) {                        // move charge i to the pointer, inside the canvas
      const r = canvas.getBoundingClientRect();
      s.charges[i].x = clamp((e.clientX - r.left) / s.w, s.R / s.w, 1 - s.R / s.w);
      s.charges[i].y = clamp((e.clientY - r.top) / s.h, s.R / s.h, 1 - s.R / s.h);
    }

    canvas.addEventListener("pointerdown", (e) => {
      const i = hit(e);
      if (i < 0) return;                           // pressed on empty space
      const now = performance.now();
      if (lastTap.i === i && now - lastTap.t < 350) {   // second press within 350 ms = double tap
        s.charges[i].q *= -1;                      // flip the sign
        lastTap = { i: -1, t: 0 };
        s.scale[i] = 0.8;                          // start small ...
        update();
        tween(i, 1, 180);                          // ... and pop back to full size
        return;
      }
      lastTap = { i, t: now };
      dragging = i; selected = i;
      tween(i, 1.12, 120);                         // charge swells slightly while held
      canvas.setPointerCapture(e.pointerId);       // keep receiving moves outside the canvas
    });
    canvas.addEventListener("pointermove", (e) => {
      if (dragging >= 0) { moveTo(dragging, e); update(); return; }
      canvas.style.cursor = hit(e) >= 0 ? "grab" : "default";
    });
    const release = () => {                        // let go of the charge
      if (dragging >= 0) tween(dragging, 1, 160);  // settle back to normal size
      dragging = -1;
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    canvas.addEventListener("keydown", (e) => {
      const c = s.charges[selected], d = 0.03;     // d = how far an arrow key moves a charge
      if (e.key === "1") selected = 0;
      else if (e.key === "2") selected = 1;
      else if (e.key === "ArrowLeft") c.x = Math.max(s.R / s.w, c.x - d);
      else if (e.key === "ArrowRight") c.x = Math.min(1 - s.R / s.w, c.x + d);
      else if (e.key === "ArrowUp") c.y = Math.max(s.R / s.h, c.y - d);
      else if (e.key === "ArrowDown") c.y = Math.min(1 - s.R / s.h, c.y + d);
      else if (e.key === "Enter" || e.key === " ") c.q *= -1;
      else return;                                 // some other key: leave it alone
      e.preventDefault();                          // stop the page scrolling
      update();
    });
    canvas.addEventListener("focus", draw);        // show the selection ring
    canvas.addEventListener("blur", draw);         // hide it again

    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
    new ResizeObserver(() => { const z = fit(canvas, ctx, 2); s.setSize(z.w, z.h); draw(); }).observe(canvas);
    const z = fit(canvas, ctx, 2); s.setSize(z.w, z.h);
    reveal();
  }

  /* ================= INTERACTIVE PROJECTILE ================= */
  function mountProjectile(canvas) {
    const ctx = canvas.getContext("2d");
    const s = projectileScene("play");
    let aiming = false, raf = 0, last = 0;

    const draw = () => { ctx.clearRect(0, 0, s.w, s.h); s.draw(ctx); };

    function loop(now) {                           // runs only while a ball is flying
      s.step(Math.min(0.05, (now - last) / 1000)); last = now;
      draw();
      raf = s.active() ? requestAnimationFrame(loop) : 0;
    }
    const run = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    /* Set the launch speed and angle from the pointer position. */
    function aimFrom(e) {
      const r = canvas.getBoundingClientRect();
      const dx = e.clientX - r.left - s.ox, dy = s.gy - (e.clientY - r.top);   // pointer relative to the launcher
      s.aim.a = clamp(Math.atan2(dy, dx), (5 * Math.PI) / 180, (85 * Math.PI) / 180);
      s.aim.v = clamp(Math.hypot(dx, dy) / s.k, 4, 34);
    }

    canvas.addEventListener("pointerdown", (e) => {
      aiming = true;
      s.shots.length = 0;                          // clear the previous shot
      s.aimAlpha = 1;                              // arrow back to full brightness
      aimFrom(e); draw();
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => { if (aiming) { aimFrom(e); draw(); } });
    canvas.addEventListener("pointerup", () => {   // releasing launches
      if (!aiming) return;
      aiming = false;
      s.launch(s.aim.v, s.aim.a, reduceMotion);   // with reduced motion, show the finished flight at once
      if (reduceMotion) draw(); else run();
    });
    canvas.addEventListener("pointercancel", () => { aiming = false; });

    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
    new ResizeObserver(() => { const z = fit(canvas, ctx, 2); s.setSize(z.w, z.h); draw(); }).observe(canvas);
    const z = fit(canvas, ctx, 2); s.setSize(z.w, z.h); draw();
  }

  /* ================= BACKGROUND LOOP (home page) ================= */
  function mountBackground(canvas) {
    const ctx = canvas.getContext("2d");
    const field = fieldScene({ lines: 14, step: 4, maxSteps: 1200 });  // fewer, coarser lines: cheaper to redraw
    const proj = projectileScene("ambient");
    const mag = magnetScene();
    const scenes = [field, proj, mag];            // the loop plays these in order
    const SEG = 12, FADE = 1.2;                    // seconds per scene, and length of the crossfade
    let w = 0, h = 0, elapsed = 0, last = 0, raf = 0;

    const drawScene = (scene, a) => { ctx.globalAlpha = a; scene.draw(ctx); ctx.globalAlpha = 1; };
    function render() {
      ctx.clearRect(0, 0, w, h);
      const n = scenes.length, i = Math.floor(elapsed / SEG) % n, p = elapsed % SEG;   // which scene, and how far into it
      if (p < FADE && elapsed >= SEG) {            // crossfade from the previous scene
        const f = 1 - Math.pow(1 - p / FADE, 3);   // ease-out: the new scene arrives quickly, then settles
        drawScene(scenes[(i + n - 1) % n], 1 - f);
        drawScene(scenes[i], f);
      } else drawScene(scenes[i], 1);
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (now - last < 28) return;                 // about 30 frames a second; 28 (not 33) so a 60 Hz screen gets an even every-other-frame rhythm
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      elapsed += dt;
      field.ambient(elapsed); proj.step(dt); mag.step(dt);
      render();
    }

    const resize = () => { const z = fit(canvas, ctx, 2); w = z.w; h = z.h; field.setSize(w, h); proj.setSize(w, h); mag.setSize(w, h); render(); };
    new ResizeObserver(resize).observe(canvas);
    resize();
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);

    if (reduceMotion) { field.ambient(0); render(); return; }   // one still frame, no loop
    document.addEventListener("visibilitychange", () => {      // pause while the tab is hidden
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  for (const canvas of canvases) {                 // start whichever demo each canvas asks for
    const kind = canvas.dataset.demo;
    if (kind === "field") mountField(canvas);
    else if (kind === "projectile") mountProjectile(canvas);
    else if (kind === "background") mountBackground(canvas);
  }
})();
