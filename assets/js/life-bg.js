/* Faint Game of Life background: the ANNA pattern (assets/life/anna.rle)
 * evolves behind every page and settles into the word ANNA after 448
 * generations. The generation is kept in sessionStorage, so moving between
 * pages continues the run instead of restarting it. With reduced motion
 * requested, it shows the settled word without animating. */
(function () {
  'use strict';
  if (window.__lifeBg) return;
  window.__lifeBg = true;

  var RATE = 10;            // generations per second
  var MAX_GEN = 460;        // the pattern is still from generation 448 on
  var START_KEY = 'lifeBgStart';
  var ALPHA = 0.08;         // how faint the cells are

  var canvas = document.createElement('canvas');
  canvas.id = 'life-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  function parseRLE(text) {
    var cells = [], x = 0, y = 0, n = '';
    var body = text.split('\n').filter(function (l) {
      return l && l[0] !== '#' && !/^\s*x\s*=/.test(l);
    }).join('');
    for (var i = 0; i < body.length; i++) {
      var ch = body[i];
      if (ch >= '0' && ch <= '9') { n += ch; continue; }
      var k = n ? parseInt(n, 10) : 1; n = '';
      if (ch === 'b') x += k;
      else if (ch === 'o') { for (var j = 0; j < k; j++) cells.push([x + j, y]); x += k; }
      else if (ch === '$') { y += k; x = 0; }
      else if (ch === '!') break;
    }
    return cells;
  }

  // Cells are packed into one integer key; the offset keeps coordinates positive.
  var OFF = 4096, SPAN = 8192;
  function key(x, y) { return (x + OFF) * SPAN + (y + OFF); }

  function step(live) {
    var counts = new Map();
    live.forEach(function (k) {
      var x = Math.floor(k / SPAN) - OFF, y = (k % SPAN) - OFF;
      for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
          if (dx || dy) {
            var nk = key(x + dx, y + dy);
            counts.set(nk, (counts.get(nk) || 0) + 1);
          }
        }
      }
    });
    var next = new Set();
    counts.forEach(function (c, k) {
      if (c === 3 || (c === 2 && live.has(k))) next.add(k);
    });
    return next;
  }

  var live, gen = 0, bounds, timer = null;

  function color() {
    var c = getComputedStyle(document.body).getPropertyValue('--global-text-color').trim() || '#000';
    ctx.fillStyle = c;
    return c;
  }

  function draw() {
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var bw = bounds.x1 - bounds.x0 + 1, bh = bounds.y1 - bounds.y0 + 1;
    var s = Math.min(w / (bw * 1.08), h / (bh * 1.08));
    var ox = (w - bw * s) / 2 - bounds.x0 * s;
    var oy = (h - bh * s) / 2 - bounds.y0 * s;
    color();
    ctx.globalAlpha = ALPHA;
    var size = Math.max(s * 0.9, 0.75);
    live.forEach(function (k) {
      var x = Math.floor(k / SPAN) - OFF, y = (k % SPAN) - OFF;
      ctx.fillRect(ox + x * s, oy + y * s, size, size);
    });
  }

  function targetGen() {
    var start;
    try { start = parseInt(sessionStorage.getItem(START_KEY), 10); } catch (e) { start = NaN; }
    if (!start) {
      start = Date.now();
      try { sessionStorage.setItem(START_KEY, String(start)); } catch (e) {}
    }
    return Math.min(MAX_GEN, Math.floor((Date.now() - start) / 1000 * RATE));
  }

  function advanceTo(g) { while (gen < g) { live = step(live); gen++; } }

  function tick() {
    if (document.hidden) return;
    var g = Math.min(MAX_GEN, gen + 1);
    advanceTo(g);
    draw();
    if (gen >= MAX_GEN && timer) { clearInterval(timer); timer = null; }
  }

  function init(text) {
    var cells = parseRLE(text);
    if (!cells.length) { canvas.remove(); return; }
    live = new Set(cells.map(function (c) { return key(c[0], c[1]); }));
    bounds = cells.reduce(function (b, c) {
      return { x0: Math.min(b.x0, c[0]), y0: Math.min(b.y0, c[1]),
               x1: Math.max(b.x1, c[0]), y1: Math.max(b.y1, c[1]) };
    }, { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    advanceTo(reduce ? MAX_GEN : targetGen());
    draw();
    if (!reduce && gen < MAX_GEN) timer = setInterval(tick, 1000 / RATE);
    window.addEventListener('resize', draw);
  }

  var src = (document.querySelector('meta[name="life-bg-rle"]') || {}).content || '/assets/life/anna.rle';
  fetch(src).then(function (r) { return r.ok ? r.text() : ''; }).then(init).catch(function () { canvas.remove(); });
})();
