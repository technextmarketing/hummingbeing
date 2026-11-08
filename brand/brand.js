(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* toast + copy */
  var toastEl = $('#toast'), tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('on'); }, 1800); }
  function copy(t) {
    var done = function () { toast('Copied ' + t); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
  }

  /* rail: active chapter, progress, mobile menu */
  var links = $$('#railList a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function setOn(id) { links.forEach(function (a) { var on = a.getAttribute('href') === '#' + id; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  function onScroll() {
    var y = window.scrollY + window.innerHeight * 0.35, cur = secs[0].id;
    secs.forEach(function (s) { if (s.offsetTop <= y) cur = s.id; });
    setOn(cur);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    $('#prog').style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();
  var rail = $('#rail'), mb = $('#menuBtn');
  mb.addEventListener('click', function () { var o = rail.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  links.forEach(function (a) { a.addEventListener('click', function () { rail.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }); });

  /* reveal */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else $$('.reveal').forEach(function (el) { el.classList.add('in'); });

  /* colour */
  function hexRgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function lum(rgb) { var a = rgb.map(function (v) { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
  function ratio(a, b) { var l1 = lum(hexRgb(a)), l2 = lum(hexRgb(b)), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + .05) / (lo + .05); }
  function cmyk(rgb) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, k = 1 - Math.max(r, g, b);
    if (k >= 1) return [0, 0, 0, 100];
    return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map(function (v) { return Math.round(v * 100); });
  }
  var cols = [
    ['Navy', '#242E42', 'Headings, text, footer, dark bands.'],
    ['Gold', '#F5A623', 'Wordmark, the italic word on dark, button outline and fill.'],
    ['Cream', '#FAFAF8', 'Page background.'],
    ['Navy deep', '#1A2030', 'Event heroes, menu sheet.'],
    ['Gold dark', '#C98000', 'Hover; gold text at large sizes.'],
    ['Gold tint', '#FDF3E1', 'Soft panels.'],
    ['Logo gold', '#FCB01D', 'Wordmark in the logo artwork.'],
    ['Logo navy', '#21366B', 'Bird body, descriptor.'],
    ['Throat red', '#D61F26', 'Logo only.'],
    ['Wing yellow', '#FAED2E', 'Logo, illustration.'],
    ['Poster navy', '#2F3D65', 'Elegant posters.'],
    ['Body text', '#3D4250', 'Paragraphs.'],
    ['Text mid', '#5F6472', 'Secondary text.'],
    ['Link blue', '#2EA3F2', 'Links; one small poster accent.']
  ];
  $('#swatches').innerHTML = cols.map(function (c) {
    var r = hexRgb(c[1]), k = cmyk(r);
    return '<button class="swc reveal in" data-copy="' + c[1] + '" aria-label="Copy ' + c[0] + ' ' + c[1] + '"><div class="chip" style="background:' + c[1] + '"></div><div class="inf"><b>' + c[0] + '</b><small>' + c[2] + '</small><code>HEX ' + c[1] + '<br>RGB ' + r.join(' ') + '<br>CMYK ' + k.join(' ') + '</code></div></button>';
  }).join('');
  $('#swatches').addEventListener('click', function (e) { var b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy); });
  var pairs = [
    ['Navy on cream', '#242E42', '#FAFAF8', 'Aa', 28],
    ['Body text on white', '#3D4250', '#FFFFFF', 'Aa', 28],
    ['Gold on navy deep', '#F5A623', '#1A2030', 'Aa', 28],
    ['Navy on gold (button label)', '#242E42', '#F5A623', 'Aa', 28],
    ['Gold text, small, on cream', '#84590E', '#FAFAF8', 'Aa', 28],
    ['Gold text, display 24 px+, on cream', '#A8741C', '#FAFAF8', 'Aa', 28],
    ['White on gold', '#FFFFFF', '#F5A623', 'Aa', 28],
    ['Link blue on white', '#2EA3F2', '#FFFFFF', 'Aa', 28]
  ];
  $('#contrast').innerHTML = pairs.map(function (p) {
    var r = ratio(p[1], p[2]), big = /display/.test(p[0]);
    var cls = r >= 7 ? 'p' : r >= 4.5 ? 'p' : (r >= 3 && big) ? 'l' : 'f';
    var lab = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : (r >= 3 && big) ? 'AA large' : 'Fails';
    return '<div class="cx reveal in"><div class="s" style="background:' + p[2] + ';color:' + p[1] + '">' + p[3] + ' <span style="font-size:15px;font-weight:400;font-family:Jost,sans-serif">' + p[0] + '</span></div><div class="m"><span>' + p[1] + ' on ' + p[2] + '<br><b>' + r.toFixed(2) + ' : 1</b></span><span class="badge ' + cls + '">' + lab + '</span></div></div>';
  }).join('');

  /* taglines */
  var tl = $('#tlLine'), tabs = $$('#tlTabs button');
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { tabs.forEach(function (x) { x.setAttribute('aria-selected', x === b); }); tl.innerHTML = b.dataset.t.replace(/&lt;/g, '<').replace(/&gt;/g, '>'); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click(); }
    });
  });

  /* type tester */
  var tx = $('#tt'), ts = $('#ts'), tw = $('#tw');
  function apply() {
    var w = tw.value.split('|'); tx.style.fontSize = ts.value + 'px'; tx.style.fontWeight = w[0]; tx.style.fontStyle = w[1]; $('#to').textContent = ts.value + ' px';
  }
  ts.addEventListener('input', apply); tw.addEventListener('change', apply); tx.addEventListener('input', function () { tx.style.height = 'auto'; tx.style.height = tx.scrollHeight + 'px'; });

  /* generated line art */
  var wave = $('#wave'), s = '';
  for (var i = 0; i < 18; i++) {
    var o = i * 3.2, d = 'M0 ' + (96 - o * 0.4);
    for (var x = 0; x <= 300; x += 10) d += ' L' + x + ' ' + (96 - o * .4 - (x / 300) * 56 + Math.sin(x / 26 + i * .22) * (5 + i * .35)).toFixed(1);
    s += '<path d="' + d + '" stroke-width="' + (i === 9 ? 1.6 : .6) + '" opacity="' + (0.35 + (i === 9 ? .6 : 0)) + '"/>';
  }
  wave.innerHTML = s;
  var grid = $('#grid'); s = '';
  for (var c = 0; c <= 12; c++) { var d2 = 'M' + (c * 20) + ' 0'; for (var y = 0; y <= 150; y += 10) d2 += ' L' + (c * 20 + (c > 5 ? Math.sin(y / 18 + c) * (c - 5) * 1.8 : 0)).toFixed(1) + ' ' + y; s += '<path d="' + d2 + '"/>'; }
  for (var r2 = 0; r2 <= 7; r2++) { var d3 = 'M0 ' + r2 * 21; for (var x2 = 0; x2 <= 240; x2 += 10) d3 += ' L' + x2 + ' ' + (r2 * 21 + (x2 > 100 ? Math.sin(x2 / 22 + r2) * ((x2 - 100) / 140) * 6 : 0)).toFixed(1); s += '<path d="' + d3 + '"/>'; }
  grid.innerHTML = s;

  /* photo filter + lightbox */
  var pf = $$('#pf button'), tiles = $$('#pg .tile');
  pf.forEach(function (b) {
    b.addEventListener('click', function () {
      pf.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      tiles.forEach(function (t) { t.hidden = !(b.dataset.f === 'all' || t.dataset.cat === b.dataset.f); });
    });
  });
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), last;
  function open(src, cap, from) {
    lbImg.src = src; lbImg.alt = cap; lbCap.textContent = cap; last = from;
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }
  tiles.forEach(function (t) { t.addEventListener('click', function () { open(t.dataset.src, t.dataset.cap, t); }); });
  $$('img[data-zoom]').forEach(function (im) { im.addEventListener('click', function () { open(im.dataset.zoom, im.dataset.cap || im.alt, im); }); });
  $('#lbX').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', function () { if (last && last.focus) last.focus(); });

  /* buttons: fill from pointer */
  $$('.hb-btn').forEach(function (b) {
    b.addEventListener('pointerenter', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--fx', (e.clientX - r.left) + 'px'); b.style.setProperty('--fy', (e.clientY - r.top) + 'px'); });
    b.addEventListener('pointerleave', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--fx', (e.clientX - r.left) + 'px'); b.style.setProperty('--fy', (e.clientY - r.top) + 'px'); });
  });

  /* easing demo */
  var dots = $$('.dot[data-e]');
  function run() {
    dots.forEach(function (d) {
      var w = d.parentNode.clientWidth - 22;
      d.style.transition = 'none'; d.style.transform = 'translateX(0)'; void d.offsetWidth;
      d.style.transition = 'transform ' + (+d.dataset.d * 2) + 'ms ' + d.dataset.e; d.style.transform = 'translateX(' + w + 'px)';
    });
  }
  if (!reduce) {
    var started = false, eo = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !started) { started = true; run(); setInterval(run, 2800); }
    }); eo.observe($('#eases'));
  } else dots.forEach(function (d) { d.style.transform = 'translateX(' + (d.parentNode.clientWidth - 22) + 'px)'; });
})();
