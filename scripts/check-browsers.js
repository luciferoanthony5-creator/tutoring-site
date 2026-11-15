// Checks the site in Chromium, Firefox and WebKit at 320, 390 and 1280px: sideways scroll, menu, search, video click/tap.
// Start the site first:  python3 scripts/build.py && python3 -m http.server 8000
// Run:  node scripts/check-browsers.js <path to a playwright module folder> <folder for screenshots>
//   e.g. node scripts/check-browsers.js ~/.npm/_npx/<id>/node_modules/playwright /tmp/shots
// Browsers come from ~/.cache/ms-playwright; update the folder names below if their versions change.
const pw = require(process.argv[2]);
const fs = require('fs'), H = process.env.HOME + '/.cache/ms-playwright/';
const find = (d, n) => { for (const f of fs.readdirSync(d, {withFileTypes:true})) { const p = d + '/' + f.name; if (f.isDirectory()) { const r = find(p, n); if (r) return r; } else if (f.name === n) return p; } };
const exe = { chromium: find(H+'chromium-1248','chrome'), firefox: find(H+'firefox-1572','firefox'), webkit: find(H+'webkit-2388','pw_run.sh') };
const B = 'http://localhost:8000/';
const pages = ['index.html','search.html','about.html','electricity-magnetism/index.html','electricity-magnetism/unit-2/2-2-flux-and-gauss.html'];
(async () => {
  for (const name of ['chromium','firefox','webkit']) {
    const out = [];
    try {
      const br = await pw[name].launch({ executablePath: exe[name] });
      for (const w of [320, 390, 1280]) {
        const ctx = await br.newContext({ viewport: { width: w, height: 800 }, hasTouch: w < 500 });
        const p = await ctx.newPage(); const errs = [];
        p.on('console', m => { if (m.type() === 'error' && !/youtube|ytimg|googlevideo|doubleclick/i.test(m.text() + m.location().url)) errs.push(m.text().slice(0,120)); });
        p.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0,120)));
        for (const u of pages) {
          await p.goto(B + u, { waitUntil: 'load' }); await p.waitForTimeout(300);
          const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (o > 0) out.push(`OVERFLOW ${w}px ${u} by ${o}`);
          const mi = await p.locator('#menu li').count(); if (!mi) out.push(`NO MENU ${w} ${u}`);
        }
        // search
        await p.goto(B + 'search.html'); await p.fill('#q', 'gauss'); await p.waitForTimeout(150);
        const g = await p.locator('#search-results a').count(), gc = await p.textContent('#search-count');
        await p.fill('#q', 'zzzz'); await p.waitForTimeout(150);
        const z = await p.locator('#search-results a').count(), zt = (await p.textContent('#main')).replace(/\s+/g,' ').slice(-90);
        out.push(`${w} search gauss=${g} "${gc.trim()}" zzzz=${z} "${zt.trim()}"`);
        // video
        await p.goto(B + pages[4]); await p.waitForTimeout(1200);
        const v = p.locator('a.video').first();
        const box = await v.boundingBox(), img = await p.evaluate(() => { const i = document.querySelector('a.video img'); return i ? i.className + ' ' + i.naturalWidth : 'no img'; });
        if (w < 500) { await p.locator('#menu-btn').tap(); await p.waitForTimeout(300); const op = await p.getAttribute('#menu-btn','aria-expanded'); await p.locator('#menu-btn').tap(); await p.waitForTimeout(300); out.push(`${w} menu tap open=${op}`); await v.tap(); } else await v.click();
        await p.waitForTimeout(500);
        const src = await p.evaluate(() => document.querySelector('.video iframe')?.src || 'NO IFRAME');
        out.push(`${w} video box=${Math.round(box.width)}x${Math.round(box.height)} thumb=[${img}] after=${src.slice(0,60)} url=${p.url().slice(-28)}`);
        if (w !== 390 || name === 'chromium') {} 
        await p.goto(B + pages[4]); await p.waitForTimeout(800); await p.screenshot({ path: `${process.argv[3]}/${name}-${w}.png` });
        if (errs.length) out.push(`${w} ERRORS: ` + [...new Set(errs)].join(' | '));
        await ctx.close();
      }
      out.unshift('version ' + br.version()); await br.close();
    } catch (e) { out.push('FAILED: ' + e.message.split('\n').slice(0,3).join(' ')); }
    console.log(`== ${name}\n` + out.join('\n'));
  }
})();
