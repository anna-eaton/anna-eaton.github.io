/*
 * Hilbert curves for the /fun/ page: the puzzle's hint overlay and a small
 * animated drawing. Vanilla JS, no dependencies.
 */
(function () {
  'use strict';

  // Position of step d along an n x n Hilbert curve (n a power of two).
  // x is the column and y the row (y grows downward), so the curve starts at
  // the top-left cell, takes its first step down, and ends at the top-right.
  function d2xy(n, d) {
    var x = 0, y = 0, t = d;
    for (var s = 1; s < n; s *= 2) {
      var rx = 1 & (t / 2);
      var ry = 1 & (t ^ rx);
      if (ry === 0) {
        if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
        var tmp = x; x = y; y = tmp;
      }
      x += s * rx;
      y += s * ry;
      t = Math.floor(t / 4);
    }
    return [x, y];
  }

  function hilbertPoints(order) {
    var n = 1 << order, pts = [];
    for (var d = 0; d < n * n; d++) pts.push(d2xy(n, d));
    return pts;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { d2xy: d2xy, hilbertPoints: hilbertPoints };
  }
  if (typeof document === 'undefined') return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Puzzle hint: toggles the curve drawn over the monogram. */
  function initHint(btn) {
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'Hide hint' : 'Hint';
      target.classList.toggle('is-hinted', on);
    });
  }

  /* Animated drawing: orders 1..maxOrder, traced one after another, looping. */
  function initAnimation(svg) {
    var NS = 'http://www.w3.org/2000/svg';
    var size = 256, maxOrder = 5;
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 'hilbert-anim__path');
    svg.appendChild(path);

    function setOrder(order) {
      var n = 1 << order, cell = size / n;
      var d = hilbertPoints(order).map(function (p, i) {
        return (i ? 'L' : 'M') + ((p[0] + 0.5) * cell).toFixed(2) + ' ' + ((p[1] + 0.5) * cell).toFixed(2);
      }).join('');
      path.setAttribute('d', d);
      path.style.strokeWidth = Math.max(1.5, Math.min(6, cell * 0.3)) + 'px';
      return (n * n - 1) * cell; // total length
    }

    if (reduceMotion) { setOrder(4); return; }

    var order = 1, length = setOrder(1), phaseStart = null, visible = true, last = 0;
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(svg);
    }

    function frame(t) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) { if (phaseStart !== null) phaseStart += t - last; last = t; return; }
      last = t;
      if (phaseStart === null) phaseStart = t;
      var draw = 700 + 450 * order, hold = order === maxOrder ? 2500 : 900;
      var e = t - phaseStart;
      var f = Math.min(1, e / draw);
      f = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; // ease in-out
      path.style.strokeDashoffset = (length * (1 - f)).toFixed(2);
      if (e > draw + hold) {
        order = order === maxOrder ? 1 : order + 1;
        length = setOrder(order);
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        phaseStart = t;
      }
    }
    requestAnimationFrame(frame);
  }

  function init() {
    var hints = document.querySelectorAll('[data-hilbert-hint]');
    for (var i = 0; i < hints.length; i++) initHint(hints[i]);
    var anims = document.querySelectorAll('[data-hilbert-anim]');
    for (var j = 0; j < anims.length; j++) initAnimation(anims[j]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
