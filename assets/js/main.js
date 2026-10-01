(function () {
  "use strict";
  var K = window.KOFFEELY, P = window.PRODUCTS || [];
  var bySlug = {};
  P.forEach(function (p) { bySlug[p.slug] = p; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "Rs. " + n.toLocaleString("en-US"); };
  var img = function (name) { return K.img + name + ".webp"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fullName = function (p) { return p.name + " (" + p.size + ")"; };

  /* ---------- storage (always guarded) ---------- */
  var KEY = "koffeely-cart";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* cart still works for this visit */ } }
  var cart = load();

  /* ---------- cart ---------- */
  function cartLines() {
    return Object.keys(cart).filter(function (s) { return bySlug[s] && cart[s] > 0; })
      .map(function (s) { return { p: bySlug[s], qty: cart[s] }; });
  }
  function cartCount() { return cartLines().reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartTotal() { return cartLines().reduce(function (n, l) { return n + l.qty * l.p.price; }, 0); }

  function add(slug, qty, silent) {
    var p = bySlug[slug];
    if (!p || !p.available) return false;
    cart[slug] = Math.min(20, (cart[slug] || 0) + (qty || 1));
    save(cart); renderCart();
    if (!silent) toast("Added " + p.name + " to your cart");
    return true;
  }
  function setQty(slug, qty) {
    if (qty <= 0) delete cart[slug]; else cart[slug] = Math.min(20, qty);
    save(cart); renderCart();
  }

  // Shopify cart permalink: /cart/<variant>:<qty>,<variant>:<qty>
  function checkoutUrl() {
    return K.store + "/cart/" + cartLines().map(function (l) { return l.p.variantId + ":" + l.qty; }).join(",");
  }
  function waUrl(lines) {
    var text = "Hi Koffeely! I'd like to order:\n" +
      lines.map(function (l) { return "• " + l.qty + " × " + fullName(l.p) + " (" + money(l.p.price * l.qty) + ")"; }).join("\n") +
      "\nTotal: " + money(lines.reduce(function (n, l) { return n + l.qty * l.p.price; }, 0)) + "\n\nName:\nCity:\nAddress:";
    return "https://wa.me/" + K.whatsapp + "?text=" + encodeURIComponent(text);
  }

  function renderCart() {
    var n = cartCount();
    $$("[data-cart-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    var box = $("#cart-items");
    if (!box) return;
    var lines = cartLines();
    if (!lines.length) {
      box.innerHTML = '<div class="empty"><p>Your cart is empty.</p><a class="btn" href="shop.html">Shop coffee and matcha</a></div>';
    } else {
      box.innerHTML = lines.map(function (l) {
        var p = l.p;
        return '<div class="line-item">' +
          '<img src="' + img(p.images[0][0]) + '" alt="" width="64" height="80">' +
          '<div><h3>' + esc(p.name) + '</h3><span class="card-size">' + esc(p.size) + " · " + money(p.price) + '</span>' +
          '<div class="qty"><button type="button" data-dec="' + p.slug + '" aria-label="Decrease ' + esc(p.name) + '">−</button>' +
          '<output aria-live="polite">' + l.qty + '</output>' +
          '<button type="button" data-inc="' + p.slug + '" aria-label="Increase ' + esc(p.name) + '">+</button></div></div>' +
          '<div style="text-align:right"><div class="price">' + money(p.price * l.qty) + '</div>' +
          '<button type="button" class="remove" data-remove="' + p.slug + '">Remove</button></div></div>';
      }).join("");
    }
    var foot = $("#cart-foot");
    foot.hidden = !lines.length;
    if (lines.length) {
      $("#cart-subtotal").textContent = money(cartTotal());
      $("#cart-checkout").href = checkoutUrl();
      $("#cart-wa").href = waUrl(lines);
    }
  }

  function openCart() {
    var d = $("#cart"), b = $("#cart-backdrop");
    b.hidden = false; requestAnimationFrame(function () { b.classList.add("show"); d.classList.add("open"); });
    d.setAttribute("aria-hidden", "false"); d.inert = false;
    document.body.style.overflow = "hidden";
    $("#cart-close").focus();
  }
  function closeCart() {
    var d = $("#cart"), b = $("#cart-backdrop");
    d.classList.remove("open"); b.classList.remove("show");
    d.setAttribute("aria-hidden", "true"); d.inert = true;
    document.body.style.overflow = "";
    setTimeout(function () { b.hidden = true; }, 220);
    var t = $("[data-open-cart]"); if (t) t.focus();
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---------- product cards ---------- */
  function card(p) {
    var badge = !p.available ? '<span class="badge badge--out">Sold out</span>'
      : p.compareAt ? '<span class="badge badge--sale">' + esc(p.badge) + '</span>'
      : p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : "";
    var price = money(p.price) + (p.compareAt ? "<s>" + money(p.compareAt) + "</s>" : "");
    var btn = p.available
      ? '<button type="button" class="btn add-btn" data-add="' + p.slug + '" aria-label="Add ' + esc(fullName(p)) + ' to cart">Add</button>'
      : '<a class="btn btn--ghost add-btn" href="product.html#' + p.slug + '">Notify me</a>';
    return '<article class="card' + (p.category === "matcha" ? " card--matcha" : "") + '">' +
      '<a class="card-media" href="product.html#' + p.slug + '" tabindex="-1" aria-hidden="true">' + badge +
      '<img src="' + img(p.images[0][0]) + '" alt="' + esc(p.images[0][1]) + '" loading="lazy" width="500" height="625"></a>' +
      '<div class="card-body"><h3><a href="product.html#' + p.slug + '">' + esc(p.name) + '</a></h3>' +
      '<span class="card-size">' + esc(p.size) + '</span>' +
      '<p class="card-tag">' + esc(p.tagline) + '</p>' +
      '<div class="card-foot"><span class="price">' + price + '</span>' + btn + '</div></div></article>';
  }
  function sortForShop(list) {
    // sold-out items always go last
    return list.slice().sort(function (a, b) { return (b.available ? 1 : 0) - (a.available ? 1 : 0); });
  }

  function renderGrids() {
    $$("[data-products]").forEach(function (el) {
      var cat = el.getAttribute("data-category");
      var only = el.getAttribute("data-only");
      var list = only ? only.split(",").map(function (s) { return bySlug[s]; }).filter(Boolean)
        : sortForShop(P.filter(function (p) { return !cat || cat === "all" || p.category === cat; }));
      var limit = +el.getAttribute("data-limit") || list.length;
      el.innerHTML = list.slice(0, limit).map(card).join("");
    });
  }

  /* ---------- shop filters ---------- */
  function initFilters() {
    var bar = $("[data-filters]"); if (!bar) return;
    var grid = $("[data-products]", document);
    function apply(cat) {
      $$(".filter", bar).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.filter === cat ? "true" : "false"); });
      grid.setAttribute("data-category", cat);
      renderGrids();
    }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest(".filter"); if (!b) return;
      apply(b.dataset.filter);
      try { history.replaceState(null, "", "#" + b.dataset.filter); } catch (err) {}
    });
    var h = location.hash.slice(1);
    apply(["coffee", "matcha", "accessories"].indexOf(h) > -1 ? h : "all");
  }

  /* ---------- bundles ---------- */
  function renderBundles() {
    $$("[data-bundles]").forEach(function (el) {
      el.innerHTML = (window.BUNDLES || []).map(function (b) {
        var items = b.items.map(function (s) { return bySlug[s]; });
        var total = items.reduce(function (n, p) { return n + p.price; }, 0);
        return '<article class="bundle"><img src="' + img(b.image) + '" alt="" loading="lazy" width="120" height="150">' +
          '<div class="bundle-body"><h3>' + esc(b.name) + '</h3><p>' + esc(b.note) + '</p>' +
          '<p class="card-size">' + items.map(function (p) { return esc(fullName(p)); }).join(" + ") + '</p>' +
          '<div class="bundle-foot"><span class="price">' + money(total) + '</span>' +
          '<button type="button" class="btn add-btn" data-bundle="' + b.id + '">Add set</button></div></div></article>';
      }).join("");
    });
  }

  /* ---------- recipes ---------- */
  function recipeCard(r, full) {
    var chip = r.base === "matcha" ? '<span class="chip chip--matcha">Matcha</span>'
      : r.base === "both" ? '<span class="chip">Coffee</span><span class="chip chip--matcha">Matcha</span>'
      : '<span class="chip">Coffee</span>';
    var body = '<h4>You need</h4><ul>' + r.ingredients.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
      "<h4>Method</h4><ol>" + r.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>";
    return '<article class="recipe" id="' + r.id + '"><div class="recipe-media"><img src="' + img(r.image) + '" alt="" loading="lazy" width="600" height="412"></div>' +
      '<div class="recipe-body"><div class="recipe-meta">' + chip + '<span class="chip">' + esc(r.time) + '</span></div>' +
      "<h3>" + esc(r.name) + "</h3>" +
      (full ? body : '<p class="card-tag">' + esc(r.ingredients.slice(0, 3).join(" · ")) + '</p><a class="link" href="recipes.html#' + r.id + '">See the recipe</a>') +
      "</div></article>";
  }
  function renderRecipes() {
    $$("[data-recipes]").forEach(function (el) {
      var full = el.hasAttribute("data-full");
      var base = el.getAttribute("data-base") || "all";
      var list = (window.RECIPES || []).filter(function (r) { return base === "all" || r.base === base || r.base === "both"; });
      var limit = +el.getAttribute("data-limit") || list.length;
      el.innerHTML = list.slice(0, limit).map(function (r) { return recipeCard(r, full); }).join("");
    });
    var bar = $("[data-recipe-filters]"); if (!bar || bar.dataset.ready) return;
    bar.dataset.ready = "1";
    bar.addEventListener("click", function (e) {
      var b = e.target.closest(".filter"); if (!b) return;
      $$(".filter", bar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $("[data-recipes]").setAttribute("data-base", b.dataset.filter);
      renderRecipes();
    });
  }

  /* ---------- product page ---------- */
  function renderProduct() {
    var root = $("#pdp"); if (!root) return;
    var slug = location.hash.slice(1) || new URLSearchParams(location.search).get("p") || "instant-coffee-100g";
    var p = bySlug[slug] || P[0];
    var qty = 1;

    document.title = fullName(p) + " | Koffeely";
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", p.tagline + " " + money(p.price) + ".");

    var ld = { "@context": "https://schema.org", "@type": "Product", name: fullName(p), description: p.description,
      brand: { "@type": "Brand", name: "Koffeely" }, image: p.images.map(function (i) { return img(i[0]); }),
      offers: { "@type": "Offer", priceCurrency: "PKR", price: p.price, url: K.store + "/products/" + ((window.SHOPIFY_HANDLES || {})[p.slug] || ""),
        availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } };
    var s = $("#product-ld"); if (s) s.textContent = JSON.stringify(ld);

    $("#crumb-name").textContent = p.name;
    var price = money(p.price) + (p.compareAt ? "<s>" + money(p.compareAt) + "</s>" : "");
    root.innerHTML =
      '<div class="gallery"><div class="gallery-main"><img id="main-img" src="' + img(p.images[0][0]) + '" alt="' + esc(p.images[0][1]) + '" width="800" height="1000"></div>' +
      '<div class="thumbs" role="group" aria-label="Product photos">' + p.images.map(function (im, i) {
        return '<button type="button" data-thumb="' + i + '" aria-current="' + (i === 0) + '" aria-label="Show photo ' + (i + 1) + ' of ' + p.images.length + '"><img src="' + img(im[0]) + '" alt="" loading="lazy" width="72" height="90"></button>';
      }).join("") + "</div></div>" +
      '<div class="pdp-info"><div style="display:grid;gap:10px"><span class="eyebrow">' + (p.category === "coffee" ? "Koffeely coffee" : p.category === "matcha" ? "Midori matcha" : "Accessories") + " · " + esc(p.size) + "</span>" +
      "<h1>" + esc(p.name) + "</h1>" + '<p class="lede">' + esc(p.tagline) + "</p></div>" +
      '<div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap"><span class="pdp-price">' + price + "</span>" +
      (p.available ? '<span class="stock">In stock, ships from Karachi</span>' : '<span class="stock stock--out">Sold out</span>') + "</div>" +
      (p.available
        ? '<div class="buy-row"><div class="qty"><button type="button" id="q-dec" aria-label="Decrease quantity">−</button><output id="q-val" aria-live="polite">1</output><button type="button" id="q-inc" aria-label="Increase quantity">+</button></div>' +
          '<button type="button" class="btn" id="pdp-add"><span>Add to cart · <span id="pdp-total">' + money(p.price) + '</span></span></button></div>' +
          '<a class="btn btn--wa btn--block" id="pdp-wa" href="#" target="_blank" rel="noopener">Order on WhatsApp</a>'
        : '<form class="inline-form" id="notify-form" novalidate><label class="sr-only" for="notify-email">Email for restock alert</label>' +
          '<input id="notify-email" type="email" placeholder="you@example.com" required style="background:var(--surface);color:var(--roast);border:1.5px solid var(--line)">' +
          '<button class="btn" type="submit">Email me when it\'s back</button></form><p class="form-msg" id="notify-msg" hidden></p>') +
      '<p>' + esc(p.description) + "</p>" +
      '<ul class="points">' + p.points.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<div class="faq">' +
      '<details><summary>Delivery and payment</summary><div><p>Orders ship from Karachi. Pay securely at checkout on koffeely.co, or order on WhatsApp.</p><p class="note" style="margin:0">Delivery times, charges and cash on delivery: confirm with Koffeely before launch.</p></div></details>' +
      '<details><summary>Returns</summary><div><p>Food items can\'t be returned once opened. If anything arrives damaged or incorrect, message us within 48 hours of delivery and we\'ll make it right.</p></div></details>' +
      (p.category === "coffee" ? '<details><summary>How much coffee per cup?</summary><div><p>Start with 1 teaspoon (about 2 g) for 200 ml of water or milk. Use 2 teaspoons for iced drinks, since the ice dilutes it.</p></div></details>' : "") +
      (p.slug === "midori-chasen" || p.slug === "midori-ritual-kit" ? '<details><summary>How do I care for the chasen?</summary><div><p>Rinse in warm water after each use (no soap), shake out and dry on a whisk holder so the prongs keep their shape.</p></div></details>' : "") +
      (p.slug === "midori-matcha" ? '<details><summary>How should I store matcha?</summary><div><p>Keep the tin tightly closed in a cool, dark place, away from heat and strong smells. Matcha tastes best within a couple of months of opening.</p></div></details>' : "") +
      "</div></div>";

    var thumbs = $$("[data-thumb]", root), main = $("#main-img");
    thumbs.forEach(function (b) {
      b.addEventListener("click", function () {
        var im = p.images[+b.dataset.thumb];
        main.src = img(im[0]); main.alt = im[1];
        thumbs.forEach(function (t) { t.setAttribute("aria-current", t === b ? "true" : "false"); });
      });
    });
    if (p.available) {
      var upd = function () {
        $("#q-val").textContent = qty; $("#pdp-total").textContent = money(qty * p.price);
        $("#pdp-wa").href = waUrl([{ p: p, qty: qty }]);
      };
      $("#q-dec").addEventListener("click", function () { qty = Math.max(1, qty - 1); upd(); });
      $("#q-inc").addEventListener("click", function () { qty = Math.min(20, qty + 1); upd(); });
      $("#pdp-add").addEventListener("click", function () { add(p.slug, qty, true); openCart(); });
      upd();
    } else {
      $("#notify-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var m = $("#notify-msg"); m.hidden = false;
        m.textContent = "Concept demo: on the live store this signs you up for a restock email through Shopify.";
      });
    }

    var pairs = $("[data-pairs]");
    if (pairs) pairs.setAttribute("data-only", p.pairs.join(","));
  }

  /* ---------- forms (demo: nothing is sent) ---------- */
  function initForms() {
    $$("form[data-demo]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var m = $(".form-msg", f.parentNode) || $(".form-msg", f);
        if (m) { m.hidden = false; m.textContent = f.getAttribute("data-demo"); }
      });
    });
  }

  /* ---------- global events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-add],[data-bundle],[data-inc],[data-dec],[data-remove],[data-open-cart],[data-close-cart],.menu-btn");
    if (!t) return;
    if (t.dataset.add) add(t.dataset.add);
    else if (t.dataset.bundle) {
      var b = (window.BUNDLES || []).filter(function (x) { return x.id === t.dataset.bundle; })[0];
      if (b) { b.items.forEach(function (s) { add(s, 1, true); }); toast("Added the " + b.name + " set"); }
    }
    else if (t.dataset.inc) setQty(t.dataset.inc, (cart[t.dataset.inc] || 0) + 1);
    else if (t.dataset.dec) setQty(t.dataset.dec, (cart[t.dataset.dec] || 0) - 1);
    else if (t.dataset.remove) setQty(t.dataset.remove, 0);
    else if (t.hasAttribute("data-open-cart")) openCart();
    else if (t.hasAttribute("data-close-cart")) closeCart();
    else if (t.classList.contains("menu-btn")) {
      var nav = $("#site-nav"), open = !nav.classList.contains("open");
      nav.classList.toggle("open", open); t.setAttribute("aria-expanded", String(open));
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("#cart") && $("#cart").classList.contains("open")) closeCart();
  });
  window.addEventListener("hashchange", function () { if ($("#pdp")) { renderProduct(); renderGrids(); window.scrollTo(0, 0); } });

  var wa = $("[data-wa-float]");
  if (wa) wa.href = "https://wa.me/" + K.whatsapp + "?text=" + encodeURIComponent("Hi Koffeely! I have a question about ");
  var cartEl = $("#cart"); if (cartEl) cartEl.inert = true;

  renderProduct();
  renderGrids();
  initFilters();
  renderBundles();
  renderRecipes();
  if ($("[data-recipes][data-full]") && location.hash.length > 1) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
  initForms();
  renderCart();
  initMotion();

  /* ---------- scroll motion: reveals, trust marquee, parallax ---------- */
  function initMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only elements below the fold get the hidden start state, so the first screen is complete at load.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
      $$(".section-head, .card, .recipe, .bundle, .founder > *, .line-card, .review, .value, .club, .contact-card, .page-head").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        var sibs = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
        el.style.setProperty("--d", (sibs % 4) * 80 + "ms");
        el.classList.add("reveal");
        io.observe(el);
      });
    }

    var trust = $(".trust");
    if (trust) {
      var ul = $("ul", trust);
      $$("li", ul).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); ul.appendChild(c); });
      trust.classList.add("trust--marquee");
    }

    var cards = $$(".line-card");
    if (cards.length) {
      var queued = false;
      var parallax = function () {
        queued = false;
        var vh = window.innerHeight;
        cards.forEach(function (c) {
          var r = c.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var off = ((r.top + r.height / 2) - vh / 2) / vh;
          $("img", c).style.setProperty("--py", (off * -36).toFixed(1) + "px");
        });
      };
      window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(parallax); } }, { passive: true });
      parallax();
    }
  }
})();
