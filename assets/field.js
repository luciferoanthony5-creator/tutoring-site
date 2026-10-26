/* =====================================================================
   field.js  -  the electric-field demo on the home page.
   Two charges sit on a canvas. Field lines leave the positive charge
   and end on the negative one. Drag a charge to move it; tap or
   double-click it to flip its sign. Keyboard: click the canvas (or Tab
   to it), press 1 or 2 to pick a charge, arrow keys to move it, Enter
   to flip its sign.
   Only runs on pages that contain <canvas id="field">.
   ===================================================================== */

(() => {                                          // wraps everything so names stay private
  const canvas = document.getElementById("field"); // find the canvas on the page
  if (!canvas) return;                             // not the home page: do nothing
  const ctx = canvas.getContext("2d");             // ctx = the pen we draw with
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches; // true if visitor asked for no animation

  const R = 14;                                    // charge radius in pixels
  /* x and y are fractions of the canvas size (0 to 1); q is the sign of the charge. */
  const charges = [
    { x: 0.32, y: 0.5, q: 1 },
    { x: 0.68, y: 0.5, q: -1 },
  ];
  let w = 0, h = 0;                                // canvas size in CSS pixels
  let lines = [];                                  // traced field lines (lists of points)
  let progress = 1;                                // 0 to 1: how much of each line is drawn
  let selected = 0;                                // which charge the keyboard moves
  let dragging = -1;                               // index of the charge being dragged, or -1
  let lastTap = { i: -1, t: 0 };                   // remembers the last press, to spot a double-tap

  /* Read a colour from the CSS tokens, so dark mode is picked up automatically. */
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* Pixel position of charge number i. */
  const pos = (i) => ({ x: charges[i].x * w, y: charges[i].y * h });

  /* Unit vector pointing along the electric field at (x, y), times `sign`. */
  function dir(x, y, sign) {
    let ex = 0, ey = 0;                            // running total of the field
    for (let i = 0; i < charges.length; i++) {
      const p = pos(i);
      const dx = x - p.x, dy = y - p.y;            // from the charge to the point
      const d2 = dx * dx + dy * dy + 1;            // +1 stops a divide-by-zero at the centre
      const d3 = d2 * Math.sqrt(d2);               // distance cubed
      ex += (charges[i].q * dx) / d3;              // each charge adds q * r / r^3
      ey += (charges[i].q * dy) / d3;
    }
    const m = Math.hypot(ex, ey) || 1;             // field strength (never 0)
    return { x: (sign * ex) / m, y: (sign * ey) / m };
  }

  /* Trace every field line and store it in `lines`. */
  function trace() {
    lines = [];
    const sign = charges.some((c) => c.q > 0) ? 1 : -1;  // follow the field from positives, or backwards from negatives
    charges.forEach((c, i) => {
      if (Math.sign(c.q) !== sign) return;         // start only from the "source" kind of charge
      const start = pos(i);
      const count = 18;                            // lines per charge
      for (let k = 0; k < count; k++) {
        const a = (2 * Math.PI * k) / count + 0.3; // angle this line leaves the charge
        let x = start.x + Math.cos(a) * R;
        let y = start.y + Math.sin(a) * R;
        const pts = [[x, y]];
        for (let step = 0; step < 1500; step++) {  // take small steps along the field
          const d1 = dir(x, y, sign);
          const dm = dir(x + d1.x * 1.5, y + d1.y * 1.5, sign); // look half a step ahead for accuracy
          x += dm.x * 3;
          y += dm.y * 3;
          pts.push([x, y]);
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break; // left the canvas
          const hit = charges.some((o, j) => {     // reached a charge of the other sign?
            if (Math.sign(o.q) === sign) return false;
            const p = pos(j);
            return Math.hypot(x - p.x, y - p.y) < R;
          });
          if (hit) break;
        }
        lines.push({ pts, sign });
      }
    });
  }

  /* Draw one small arrowhead at point p, pointing along (tx, ty). */
  function arrow(p, tx, ty) {
    const s = 6.5;                                 // arrow size
    ctx.beginPath();
    ctx.moveTo(p[0] + tx * s, p[1] + ty * s);      // tip
    ctx.lineTo(p[0] - tx * s - ty * s * 0.6, p[1] - ty * s + tx * s * 0.6); // one back corner
    ctx.lineTo(p[0] - tx * s + ty * s * 0.6, p[1] - ty * s - tx * s * 0.6); // other back corner
    ctx.closePath();
    ctx.fill();
  }

  /* Paint everything. */
  function draw() {
    ctx.clearRect(0, 0, w, h);                     // wipe the canvas
    ctx.strokeStyle = css("--grid");
    ctx.fillStyle = css("--grid");
    ctx.lineWidth = 1.3;
    for (const line of lines) {
      const n = Math.max(2, Math.floor(line.pts.length * progress)); // how many points to show
      ctx.beginPath();
      ctx.moveTo(line.pts[0][0], line.pts[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(line.pts[i][0], line.pts[i][1]);
      ctx.stroke();
      const mid = Math.floor(line.pts.length * 0.5);   // arrowhead halfway along
      if (mid > 1 && n > mid) {
        const a = line.pts[mid - 1], b = line.pts[mid + 1] || line.pts[mid];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        arrow(line.pts[mid], ((b[0] - a[0]) / len) * line.sign, ((b[1] - a[1]) / len) * line.sign);
      }
    }
    charges.forEach((c, i) => {                    // draw the charges on top
      const p = pos(i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, 2 * Math.PI);
      ctx.fillStyle = css(c.q > 0 ? "--pos" : "--neg");   // red = positive, blue = negative
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";                 // white + or - sign
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(p.x - 5.5, p.y); ctx.lineTo(p.x + 5.5, p.y);          // the horizontal bar
      if (c.q > 0) { ctx.moveTo(p.x, p.y - 5.5); ctx.lineTo(p.x, p.y + 5.5); } // the vertical bar (plus only)
      ctx.stroke();
      if (document.activeElement === canvas && i === selected) {       // ring shows the keyboard choice
        ctx.strokeStyle = css("--ink");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }

  /* Match the canvas to its on-screen size (and sharpen it on retina screens). */
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;      // screen sharpness
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);        // draw in CSS pixels
    trace();
    draw();
  }

  /* One-time reveal: the lines grow out of the charges. */
  function reveal() {
    if (reduceMotion) { progress = 1; draw(); return; }  // skip the animation if asked
    const t0 = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / 1200);    // 0 to 1 over 1.2 seconds
      progress = 1 - Math.pow(1 - t, 3);           // starts fast, eases out
      draw();
      if (t < 1) requestAnimationFrame(frame);     // keep going until finished
    };
    progress = 0;
    requestAnimationFrame(frame);
  }

  /* Which charge is under the pointer? Returns its index or -1. */
  function hit(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bestD = R + 12;                 // a little extra for fingers
    charges.forEach((c, i) => {
      const d = Math.hypot(x - pos(i).x, y - pos(i).y);
      if (d < bestD) { best = i; bestD = d; }
    });
    return best;
  }

  /* Move charge i to the pointer, keeping it inside the canvas. */
  function moveTo(i, e) {
    const r = canvas.getBoundingClientRect();
    charges[i].x = Math.min(1 - R / w, Math.max(R / w, (e.clientX - r.left) / w));
    charges[i].y = Math.min(1 - R / h, Math.max(R / h, (e.clientY - r.top) / h));
  }

  /* Re-trace and redraw straight away (used while the user is interacting). */
  function update() { progress = 1; trace(); draw(); }

  canvas.addEventListener("pointerdown", (e) => {
    const i = hit(e);
    if (i < 0) return;                             // pressed on empty space
    const now = performance.now();
    if (lastTap.i === i && now - lastTap.t < 350) { // second press within 350 ms = double tap
      charges[i].q *= -1;                          // flip the sign
      lastTap = { i: -1, t: 0 };
      update();
      return;
    }
    lastTap = { i, t: now };
    dragging = i; selected = i;
    canvas.setPointerCapture(e.pointerId);         // keep receiving moves even outside the canvas
  });

  canvas.addEventListener("pointermove", (e) => {
    if (dragging >= 0) { moveTo(dragging, e); update(); return; }
    canvas.style.cursor = hit(e) >= 0 ? "grab" : "default"; // hand cursor over a charge
  });

  const release = () => { dragging = -1; };        // let go of the charge
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  canvas.addEventListener("keydown", (e) => {
    const step = 0.03;                             // how far an arrow key moves a charge
    const c = charges[selected];
    if (e.key === "1") selected = 0;
    else if (e.key === "2") selected = 1;
    else if (e.key === "ArrowLeft") c.x = Math.max(R / w, c.x - step);
    else if (e.key === "ArrowRight") c.x = Math.min(1 - R / w, c.x + step);
    else if (e.key === "ArrowUp") c.y = Math.max(R / h, c.y - step);
    else if (e.key === "ArrowDown") c.y = Math.min(1 - R / h, c.y + step);
    else if (e.key === "Enter" || e.key === " ") c.q *= -1;
    else return;                                   // some other key: leave it alone
    e.preventDefault();                            // stop the page scrolling
    update();
  });

  canvas.addEventListener("focus", draw);          // show the selection ring
  canvas.addEventListener("blur", draw);           // hide it again
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw); // recolour when the system theme changes
  new ResizeObserver(resize).observe(canvas);      // redraw whenever the canvas changes size

  resize();
  reveal();
})();
