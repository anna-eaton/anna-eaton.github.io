/*
 * Conway's Game of Life for the /fun/ page.
 * Vanilla JS, no dependencies. The board is unbounded: live cells are kept in
 * a Set, so gliders that leave the window keep flying (cells far outside the
 * window are eventually dropped to keep things fast).
 *
 * The pure logic (RLE parsing, rule parsing, stepping) is exported for Node so
 * it can be tested without a browser.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Core logic                                                          */
  /* ------------------------------------------------------------------ */

  // Pack (x, y) into one number. Coordinates must stay within +/- OFF;
  // culling keeps them near the window, so this is never an issue in practice.
  var OFF = 1 << 20;
  var SPAN = 1 << 21;
  var NEIGHBORS = [
    -SPAN - 1, -SPAN, -SPAN + 1,
    -1, 1,
    SPAN - 1, SPAN, SPAN + 1
  ];

  function key(x, y) { return (y + OFF) * SPAN + (x + OFF); }
  function keyX(k) { return (k % SPAN) - OFF; }
  function keyY(k) { return Math.floor(k / SPAN) - OFF; }

  // Parse "B3/S23", "S23/B3", or the older "23/3" (survive/birth) notation.
  function parseRule(str) {
    var s = String(str || 'B3/S23').replace(/\s+/g, '').toUpperCase();
    var b = '3', sv = '23', m;
    if ((m = s.match(/^B([0-8]*)\/S([0-8]*)$/))) { b = m[1]; sv = m[2]; }
    else if ((m = s.match(/^S([0-8]*)\/B([0-8]*)$/))) { sv = m[1]; b = m[2]; }
    else if ((m = s.match(/^([0-8]*)\/([0-8]*)$/))) { sv = m[1]; b = m[2]; }
    b = b.replace('0', ''); // B0 makes no sense on an unbounded board
    var birth = [], survive = [];
    for (var i = 0; i <= 8; i++) {
      birth.push(b.indexOf(String(i)) >= 0);
      survive.push(sv.indexOf(String(i)) >= 0);
    }
    return { birth: birth, survive: survive, name: 'B' + b + '/S' + sv };
  }

  // Minimal RLE reader (https://conwaylife.com/wiki/Run_Length_Encoded).
  // Returns { name, rule, width, height, cells: [[x, y], ...] }.
  function parseRLE(text) {
    var lines = String(text).split(/\r?\n/);
    var name = '', rule = 'B3/S23', width = 0, height = 0, body = [];
    var headerSeen = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (line.charAt(0) === '#') {
        if (/^#N/.test(line)) name = line.slice(2).trim();
        continue;
      }
      if (!headerSeen && /^x\s*=/.test(line)) {
        headerSeen = true;
        var mx = line.match(/x\s*=\s*(\d+)/);
        var my = line.match(/y\s*=\s*(\d+)/);
        var mr = line.match(/rule\s*=\s*([^,\s]+)/i);
        if (mx) width = parseInt(mx[1], 10);
        if (my) height = parseInt(my[1], 10);
        if (mr) rule = mr[1];
        continue;
      }
      body.push(line);
    }
    var data = body.join('');
    var cells = [], x = 0, y = 0, num = '', maxX = -1, maxY = -1;
    for (var j = 0; j < data.length; j++) {
      var ch = data.charAt(j);
      if (ch >= '0' && ch <= '9') { num += ch; continue; }
      if (/\s/.test(ch)) continue;
      var n = num ? parseInt(num, 10) : 1;
      num = '';
      if (ch === '!') break;
      if (ch === 'b' || ch === '.') {
        x += n;
      } else if (ch === '$') {
        y += n;
        x = 0;
      } else if (/[a-zA-Z*]/.test(ch)) {
        // 'o' is alive; treat any other state letter as alive too.
        for (var t = 0; t < n; t++) cells.push([x + t, y]);
        x += n;
        if (x - 1 > maxX) maxX = x - 1;
        if (y > maxY) maxY = y;
      } else {
        throw new Error('Unexpected character in RLE: "' + ch + '"');
      }
    }
    return {
      name: name,
      rule: rule,
      width: width || maxX + 1,
      height: height || maxY + 1,
      cells: cells
    };
  }

  // One generation. `cells` is a Set of packed keys; returns a new Set.
  function step(cells, rule) {
    var counts = new Map();
    cells.forEach(function (k) {
      for (var i = 0; i < 8; i++) {
        var nk = k + NEIGHBORS[i];
        counts.set(nk, (counts.get(nk) || 0) + 1);
      }
    });
    var next = new Set();
    counts.forEach(function (c, k) {
      if (cells.has(k) ? rule.survive[c] : rule.birth[c]) next.add(k);
    });
    if (rule.survive[0]) {
      cells.forEach(function (k) { if (!counts.has(k)) next.add(k); });
    }
    return next;
  }

  function fromList(list) {
    var s = new Set();
    for (var i = 0; i < list.length; i++) s.add(key(list[i][0], list[i][1]));
    return s;
  }

  function toList(cells) {
    var out = [];
    cells.forEach(function (k) { out.push([keyX(k), keyY(k)]); });
    out.sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
    return out;
  }

  function bounds(cells) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    cells.forEach(function (k) {
      var x = keyX(k), y = keyY(k);
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    });
    return cells.size ? { x0: x0, y0: y0, x1: x1, y1: y1 } : null;
  }

  // Drop cells outside a box (used to forget escaped gliders).
  function cull(cells, x0, y0, x1, y1) {
    var out = new Set();
    cells.forEach(function (k) {
      var x = keyX(k), y = keyY(k);
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) out.add(k);
    });
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Presets                                                             */
  /* ------------------------------------------------------------------ */

  var PRESETS = {
    anna: {
      label: 'ANNA',
      url: null,           // set from the container's data-anna-rle attribute
      minCols: 40,
      margin: [1.03, 2],   // frame the whole swarm tightly...
      follow: true         // ...then zoom in as it converges into the word
    },
    monogram: {
      label: 'Monogram',
      minCols: 44,
      rle: '#N Monogram\nx = 8, y = 8, rule = B3/S23\n' +
        '4bobo$3obob2o$o2b5o$o2b3o$bobobo$b2o2b2o$5bobo$b3o2b2o!'
    },
    gun: {
      label: 'Gosper glider gun',
      minCols: 72,
      anchor: 'topleft', // its gliders head down and to the right
      rle: '#N Gosper glider gun\nx = 36, y = 9, rule = B3/S23\n' +
        '24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$' +
        '2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!'
    },
    rpent: {
      label: 'R-pentomino',
      // Its debris settles (at generation 1103) in a box from (-40, -17) to
      // (68, 33) relative to the seed, so frame that box from the start.
      fit: { x0: -40, y0: -17, x1: 68, y1: 33 },
      minCols: 40,
      rle: '#N R-pentomino\nx = 3, y = 3, rule = B3/S23\nb2o$2o$bo!'
    },
    soup: {
      label: 'Random soup',
      minCols: 72
    }
  };

  var core = {
    key: key, keyX: keyX, keyY: keyY,
    parseRule: parseRule, parseRLE: parseRLE, step: step,
    fromList: fromList, toList: toList, bounds: bounds, cull: cull,
    PRESETS: PRESETS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = core;
  }
  if (typeof document === 'undefined') return;

  /* ------------------------------------------------------------------ */
  /* Browser UI                                                          */
  /* ------------------------------------------------------------------ */

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (a) { e.setAttribute(a, attrs[a]); });
    if (text != null) e.textContent = text;
    return e;
  }

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  function LifeWidget(root) {
    this.root = root;
    this.rule = parseRule('B3/S23');
    this.cells = new Set();
    this.initial = new Set();
    this.generation = 0;
    this.playing = false;
    this.touched = false;  // has the visitor edited the current pattern?
    this.visible = true;
    this.speed = 20;       // generations per second
    // The view is a center (cx, cy) in cell coordinates plus a width in cells.
    this.view = { cx: 0, cy: 0, cols: 60 };
    this.home = null;      // view to return to on reset
    this.presetId = null;
    this.patterns = {};    // parsed RLE by preset id
    this.lastTime = 0;
    this.acc = 0;
    this.dirty = true;
    this.build();
  }

  LifeWidget.prototype.build = function () {
    var self = this;
    var root = this.root;
    root.textContent = '';

    this.canvas = el('canvas', {
      'class': 'life__canvas',
      'role': 'img',
      'aria-label': "Conway's Game of Life board. Click or tap a cell to toggle it."
    });
    var wrap = el('div', { 'class': 'life__canvas-wrap' });
    wrap.appendChild(this.canvas);
    root.appendChild(wrap);

    function button(text) {
      return el('button', { type: 'button', 'class': 'btn btn--inverse btn--small' }, text);
    }
    var controls = el('div', { 'class': 'life__controls' });
    this.playBtn = button('Play');
    this.stepBtn = button('Step');
    this.resetBtn = button('Reset');
    this.clearBtn = button('Clear');
    [this.playBtn, this.stepBtn, this.resetBtn, this.clearBtn].forEach(function (b) {
      controls.appendChild(b);
    });

    var presetLabel = el('label', { 'class': 'life__field' });
    presetLabel.appendChild(el('span', null, 'Pattern'));
    this.select = el('select', { 'class': 'life__select' });
    Object.keys(PRESETS).forEach(function (id) {
      self.select.appendChild(el('option', { value: id }, PRESETS[id].label));
    });
    presetLabel.appendChild(this.select);
    controls.appendChild(presetLabel);

    var speedLabel = el('label', { 'class': 'life__field' });
    speedLabel.appendChild(el('span', null, 'Speed'));
    this.speedInput = el('input', {
      type: 'range', min: '1', max: '60', step: '1', value: String(this.speed),
      'class': 'life__speed', 'aria-label': 'Generations per second'
    });
    speedLabel.appendChild(this.speedInput);
    controls.appendChild(speedLabel);
    root.appendChild(controls);

    this.status = el('p', { 'class': 'life__status', 'aria-live': 'off' });
    root.appendChild(this.status);

    // The ANNA pattern lives in its own RLE file; hide the option until it loads.
    PRESETS.anna.url = root.getAttribute('data-anna-rle');
    this.annaOption = this.select.querySelector('option[value="anna"]');
    this.annaOption.hidden = true;
    this.annaOption.disabled = true;

    this.playBtn.addEventListener('click', function () { self.setPlaying(!self.playing); });
    this.stepBtn.addEventListener('click', function () {
      self.setPlaying(false);
      self.tick();
      self.dirty = true;
    });
    this.resetBtn.addEventListener('click', function () { self.reset(); });
    this.clearBtn.addEventListener('click', function () {
      self.setPlaying(false);
      self.touched = true;
      self.cells = new Set();
      self.generation = 0;
      self.dirty = true;
    });
    this.select.addEventListener('change', function () { self.load(self.select.value); });
    this.speedInput.addEventListener('input', function () {
      self.speed = parseInt(self.speedInput.value, 10) || 20;
    });

    this.bindPointer();

    window.addEventListener('resize', function () { self.resize(); });
    // Re-read colors when the site's light/dark toggle flips.
    if (window.MutationObserver) {
      new MutationObserver(function () { self.readColors(); self.dirty = true; })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    // Don't burn CPU while the board is scrolled out of view.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
      }).observe(this.canvas);
    }

    this.readColors();
    this.resize();
    // Start with ANNA if its RLE file loads; otherwise with the monogram.
    this.loadAnna();
    setTimeout(function () { if (!self.presetId) self.load('monogram'); }, 1500);

    requestAnimationFrame(function loop(t) {
      self.frame(t);
      requestAnimationFrame(loop);
    });
  };

  LifeWidget.prototype.readColors = function () {
    this.colors = {
      bg: cssVar('--global-bg-color', '#fff'),
      live: cssVar('--global-text-color', '#333'),
      grid: cssVar('--global-border-color', '#eee')
    };
  };

  LifeWidget.prototype.loadAnna = function () {
    var self = this;
    var url = PRESETS.anna.url;
    if (!url || !window.fetch) { this.load('monogram'); return; }
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (text) {
      var p = parseRLE(text);
      if (!p.cells.length) throw new Error('empty pattern');
      self.patterns.anna = p;
      self.annaOption.hidden = false;
      self.annaOption.disabled = false;
      // Show ANNA first, unless the visitor has already started playing.
      if (!self.presetId || (self.presetId === 'monogram' && self.generation === 0 &&
          !self.playing && !self.touched)) {
        self.load('anna');
      }
    }).catch(function () {
      // No ANNA pattern available: keep the option hidden.
      if (!self.presetId) self.load('monogram');
    });
  };

  LifeWidget.prototype.patternFor = function (id) {
    var preset = PRESETS[id];
    if (id === 'soup') {
      var w = 54, h = Math.round(54 * this.aspect() * 0.75), cells = [];
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          if (Math.random() < 0.35) cells.push([x, y]);
        }
      }
      return { cells: cells, width: w, height: h, rule: 'B3/S23' };
    }
    if (!this.patterns[id] && preset.rle) this.patterns[id] = parseRLE(preset.rle);
    return this.patterns[id];
  };

  // Width in cells needed to show box `b` (with a margin) on this canvas.
  LifeWidget.prototype.colsFor = function (b, minCols, margin) {
    var scale = margin ? margin[0] : 1.2, pad = margin ? margin[1] : 8;
    var bw = b.x1 - b.x0 + 1, bh = b.y1 - b.y0 + 1;
    return Math.max(minCols || 40, bw * scale + pad, (bh * scale + pad) / this.aspect());
  };

  LifeWidget.prototype.load = function (id) {
    var p = this.patternFor(id);
    if (!p) return;
    var preset = PRESETS[id];
    this.presetId = id;
    this.select.value = id;
    this.rule = parseRule(p.rule);
    this.setPlaying(false);

    // Frame the pattern (or the box it is known to settle into).
    var box = preset.fit || { x0: 0, y0: 0, x1: p.width - 1, y1: p.height - 1 };
    var cols = this.colsFor(box, preset.minCols, preset.margin);
    var rows = cols * this.aspect();
    var cx, cy;
    if (preset.anchor === 'topleft') {
      cx = box.x0 - 3 + cols / 2;
      cy = box.y0 - 3 + rows / 2;
    } else {
      cx = (box.x0 + box.x1 + 1) / 2;
      cy = (box.y0 + box.y1 + 1) / 2;
    }
    this.home = { cx: cx, cy: cy, cols: cols };

    this.initial = fromList(p.cells);
    this.reset();
  };

  LifeWidget.prototype.reset = function () {
    this.setPlaying(false);
    this.cells = new Set(this.initial);
    this.generation = 0;
    this.touched = false;
    if (this.home) this.view = { cx: this.home.cx, cy: this.home.cy, cols: this.home.cols };
    this.dirty = true;
  };

  LifeWidget.prototype.aspect = function () {
    // Taller board on narrow (phone) screens.
    return (this.cssW || 600) < 500 ? 0.9 : 0.6;
  };

  LifeWidget.prototype.resize = function () {
    var cssW = this.canvas.parentNode.clientWidth || 600;
    this.cssW = cssW;
    var cssH = Math.round(cssW * this.aspect());
    this.cssH = cssH;
    var dpr = window.devicePixelRatio || 1;
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dirty = true;
  };

  LifeWidget.prototype.setPlaying = function (on) {
    this.playing = on;
    this.playBtn.textContent = on ? 'Pause' : 'Play';
    this.playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    this.acc = 0;
  };

  LifeWidget.prototype.tick = function () {
    this.cells = step(this.cells, this.rule);
    this.generation++;
    if (this.generation % 16 === 0) {
      var v = this.view, m = Math.max(200, v.cols * 2);
      this.cells = cull(this.cells, v.cx - m, v.cy - m, v.cx + m, v.cy + m);
    }
  };

  // For "follow" presets, glide the camera toward the live cells' bounding box.
  LifeWidget.prototype.followCamera = function (dt) {
    var preset = PRESETS[this.presetId];
    if (!preset || !preset.follow || this.touched || this.generation === 0) return;
    var b = bounds(this.cells);
    if (!b) return;
    var v = this.view;
    var tcols = this.colsFor(b, preset.minCols, [1.15, 8]);
    var tcx = (b.x0 + b.x1 + 1) / 2, tcy = (b.y0 + b.y1 + 1) / 2;
    var k = 1 - Math.exp(-dt / 500);
    var dc = tcols - v.cols, dx = tcx - v.cx, dy = tcy - v.cy;
    if (Math.abs(dc) < 0.02 && Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) return;
    v.cols += dc * k;
    v.cx += dx * k;
    v.cy += dy * k;
    this.dirty = true;
  };

  LifeWidget.prototype.frame = function (t) {
    var dt = this.lastTime ? Math.min(t - this.lastTime, 250) : 0;
    this.lastTime = t;
    if (!this.visible) return;
    if (this.playing) {
      this.acc += dt;
      var interval = 1000 / this.speed, steps = 0;
      while (this.acc >= interval && steps < 4) {
        this.tick();
        this.acc -= interval;
        steps++;
      }
      if (steps === 4) this.acc = 0;
      if (steps) this.dirty = true;
    }
    this.followCamera(dt);
    if (this.dirty) this.draw();
  };

  LifeWidget.prototype.draw = function () {
    var ctx = this.ctx;
    if (!ctx) return;
    this.dirty = false;
    var v = this.view, c = this.colors, W = this.cssW, H = this.cssH;
    var s = W / v.cols;
    var x0 = v.cx - v.cols / 2, y0 = v.cy - (H / s) / 2;
    this.origin = { x0: x0, y0: y0, cell: s };

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (s >= 8) {
      ctx.strokeStyle = c.grid;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (var gx = Math.ceil(x0); (gx - x0) * s <= W; gx++) {
        ctx.moveTo((gx - x0) * s, 0);
        ctx.lineTo((gx - x0) * s, H);
      }
      for (var gy = Math.ceil(y0); (gy - y0) * s <= H; gy++) {
        ctx.moveTo(0, (gy - y0) * s);
        ctx.lineTo(W, (gy - y0) * s);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    var pad = s >= 5 ? Math.max(0.5, s * 0.08) : 0;
    var size = Math.max(1, s - 2 * pad);
    ctx.fillStyle = c.live;
    ctx.beginPath();
    this.cells.forEach(function (k) {
      var px = (keyX(k) - x0) * s, py = (keyY(k) - y0) * s;
      if (px < -s || py < -s || px > W || py > H) return;
      ctx.rect(px + pad, py + pad, size, size);
    });
    ctx.fill();

    this.status.textContent = 'Generation ' + this.generation +
      ' · population ' + this.cells.size + ' · rule ' + this.rule.name;
  };

  LifeWidget.prototype.cellAt = function (evt) {
    var r = this.canvas.getBoundingClientRect();
    var o = this.origin || { x0: 0, y0: 0, cell: 10 };
    return [
      Math.floor((evt.clientX - r.left) / o.cell + o.x0),
      Math.floor((evt.clientY - r.top) / o.cell + o.y0)
    ];
  };

  LifeWidget.prototype.bindPointer = function () {
    var self = this;
    var canvas = this.canvas;
    var down = null; // { x, y, paint, moved, mouse, last }

    function setCell(xy, alive) {
      var k = key(xy[0], xy[1]);
      if (alive) self.cells.add(k); else self.cells.delete(k);
      self.touched = true;
      self.dirty = true;
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var xy = self.cellAt(e);
      down = {
        x: e.clientX, y: e.clientY, moved: false,
        paint: !self.cells.has(key(xy[0], xy[1])),
        mouse: e.pointerType === 'mouse',
        last: xy.join(',')
      };
      if (down.mouse) {
        // Mouse: toggle now and paint while dragging.
        setCell(xy, down.paint);
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!down) return;
      if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 6) down.moved = true;
      if (!down.mouse) return; // touch drags scroll the page instead
      var xy = self.cellAt(e), id = xy.join(',');
      if (id !== down.last) {
        down.last = id;
        setCell(xy, down.paint);
      }
    });

    canvas.addEventListener('pointerup', function (e) {
      if (!down) return;
      if (!down.mouse && !down.moved) setCell(self.cellAt(e), down.paint); // a tap
      down = null;
    });

    canvas.addEventListener('pointercancel', function () { down = null; });
  };

  function init() {
    var nodes = document.querySelectorAll('[data-life]');
    for (var i = 0; i < nodes.length; i++) new LifeWidget(nodes[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
