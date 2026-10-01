/* Scroll-driven hero: scrubs frames from Koffeely's product video on a canvas,
   adds a scroll-driven camera move (wide → jar label → spoon → wide), and fades
   the text beats in and out. Without JS, with reduced motion or Save-Data, the
   section stays a static hero with every beat visible. */
(function () {
  "use strict";
  var section = document.getElementById("scrolly");
  if (!section) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData || !window.requestAnimationFrame) return;

  var stage = section.querySelector(".scrolly-stage");
  var canvas = section.querySelector(".scrolly-canvas");
  var ctx = canvas.getContext("2d");
  var poster = section.querySelector(".scrolly-poster");
  var beats = [].slice.call(section.querySelectorAll("[data-beat]"));
  var chips = [].slice.call(section.querySelectorAll("[data-chip]"));
  var bar = section.querySelector(".scrolly-progress span");
  var cue = section.querySelector(".scroll-cue");

  var mobile = window.matchMedia("(max-width: 700px)").matches;
  var set = mobile ? { dir: "m", count: 30 } : { dir: "d", count: 40 };
  var frames = new Array(set.count);
  var src = function (i) { return "assets/img/hero-frames/" + set.dir + "/f" + String(i + 1).padStart(3, "0") + ".webp"; };

  section.classList.add("scrolly--on");

  /* Camera keyframes: p = scroll progress, (cx, cy) = focus point in the video
     (0–1), z = zoom over cover-fit, sx = where on screen the focus point sits. */
  var CAM = mobile ? [
    { p: 0.00, cx: 0.50, cy: 0.45, z: 1.00, sx: 0.5 },
    { p: 0.22, cx: 0.50, cy: 0.45, z: 1.03, sx: 0.5 },
    { p: 0.42, cx: 0.52, cy: 0.36, z: 1.30, sx: 0.5 },
    { p: 0.54, cx: 0.52, cy: 0.38, z: 1.32, sx: 0.5 },
    { p: 0.70, cx: 0.84, cy: 0.74, z: 1.40, sx: 0.5 },
    { p: 0.78, cx: 0.84, cy: 0.74, z: 1.42, sx: 0.5 },
    { p: 1.00, cx: 0.50, cy: 0.45, z: 1.00, sx: 0.5 },
  ] : [
    { p: 0.00, cx: 0.50, cy: 0.50, z: 1.00, sx: 0.50 },
    { p: 0.22, cx: 0.50, cy: 0.50, z: 1.04, sx: 0.52 },
    { p: 0.42, cx: 0.52, cy: 0.36, z: 1.50, sx: 0.68 },
    { p: 0.54, cx: 0.52, cy: 0.37, z: 1.54, sx: 0.68 },
    { p: 0.70, cx: 0.84, cy: 0.76, z: 1.62, sx: 0.66 },
    { p: 0.78, cx: 0.84, cy: 0.76, z: 1.64, sx: 0.66 },
    { p: 1.00, cx: 0.50, cy: 0.50, z: 1.00, sx: 0.50 },
  ];

  /* Text beats: fade in over [a, b], hold, fade out over [c, d]. */
  var BEATS = [[-1, 0, 0.18, 0.26], [0.26, 0.33, 0.50, 0.56], [0.55, 0.60, 0.76, 0.81], [0.80, 0.87, 2, 2]];
  var CHIPS = [0.58, 0.63, 0.68];

  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ramp = function (p, a, b) { return b <= a ? (p >= b ? 1 : 0) : clamp((p - a) / (b - a), 0, 1); };
  function vis(p, w) { return Math.min(ramp(p, w[0], w[1]), 1 - ramp(p, w[2], w[3])); }

  function camera(p) {
    for (var i = 1; i < CAM.length; i++) {
      if (p <= CAM[i].p) {
        var A = CAM[i - 1], B = CAM[i], t = ease((p - A.p) / (B.p - A.p || 1));
        return { cx: A.cx + (B.cx - A.cx) * t, cy: A.cy + (B.cy - A.cy) * t, z: A.z + (B.z - A.z) * t, sx: A.sx + (B.sx - A.sx) * t };
      }
    }
    return CAM[CAM.length - 1];
  }

  var cw = 0, ch = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = stage.getBoundingClientRect();
    cw = Math.round(r.width * dpr); ch = Math.round(r.height * dpr);
    canvas.width = cw; canvas.height = ch;
    last = -1; render();
  }

  function nearestFrame(i) {
    for (var d = 0; d < set.count; d++) {
      if (frames[i - d] && frames[i - d].ready) return frames[i - d];
      if (frames[i + d] && frames[i + d].ready) return frames[i + d];
    }
    return poster.complete && poster.naturalWidth ? poster : null;
  }

  function draw(img, cam) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(cw / iw, ch / ih) * cam.z;
    var w = iw * s, h = ih * s;
    var x = clamp(cw * cam.sx - cam.cx * w, cw - w, 0);
    var y = clamp(ch * 0.5 - cam.cy * h, ch - h, 0);
    ctx.drawImage(img, x, y, w, h);
  }

  function progress() {
    var r = section.getBoundingClientRect();
    var travel = section.offsetHeight - stage.offsetHeight;
    return travel > 0 ? clamp(-r.top / travel, 0, 1) : 0;
  }

  var last = -1, ticking = false;
  function render() {
    ticking = false;
    var p = progress();
    if (Math.abs(p - last) < 0.0005) return;
    last = p;
    var img = nearestFrame(Math.round(p * (set.count - 1)));
    if (img && cw) { draw(img, camera(p)); canvas.classList.add("is-live"); }
    beats.forEach(function (el, i) {
      var v = vis(p, BEATS[i]);
      el.style.setProperty("--v", v.toFixed(3));
      el.classList.toggle("is-hidden", v < 0.02);
    });
    chips.forEach(function (el, i) { el.style.setProperty("--v", ramp(p, CHIPS[i], CHIPS[i] + 0.04).toFixed(3)); });
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (cue) cue.style.opacity = (1 - ramp(p, 0, 0.08)).toFixed(3);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }

  /* Load coarse to fine (every 8th, 4th, 2nd, then the rest) so scrubbing works early. */
  function loadFrames() {
    var order = [], seen = {};
    [8, 4, 2, 1].forEach(function (step) {
      for (var i = 0; i < set.count; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
    });
    var active = 0, next = 0, LIMIT = 6;
    function pump() {
      while (active < LIMIT && next < order.length) {
        (function (i) {
          var im = new Image();
          im.decoding = "async";
          im.onload = function () { im.ready = true; active--; if (Math.abs(i - Math.round(last * (set.count - 1))) <= 4) { last = -1; onScroll(); } pump(); };
          im.onerror = function () { active--; pump(); };
          im.src = src(i);
          frames[i] = im;
          active++;
        })(order[next++]);
      }
    }
    pump();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  resize();
  if (document.readyState === "complete") loadFrames();
  else window.addEventListener("load", loadFrames);
})();
