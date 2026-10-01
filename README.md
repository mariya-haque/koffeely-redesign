# Koffeely redesign concept

This is a static website. To view it, double-click `index.html`, or serve the folder:

    python -m http.server 8000

Then open http://localhost:8000.

| File | What it is |
|---|---|
| `index.html`, `shop.html`, `product.html`, `recipes.html`, `club.html`, `about.html`, `contact.html` | Site pages |
| `product.html#<slug>` | A product page, for example `product.html#midori-matcha` |
| `assets/js/products.js` | Products, prices, Shopify variant IDs, sets and recipes. Edit the catalog here. |
| `assets/js/main.js` | Cart, filters, product page, forms |
| `assets/css/style.css` | All styles. Colour and font tokens are at the top. |
| `partials/` and `build.py` | Shared header and footer. After editing a partial, run `python build.py`. |
| `pitch.html` | The review page for the owner, in artifact format (not committed) |
| `review.html` | The same review page, standalone, served on the hosted site |
| `AUDIT.md` | The same findings as plain text |

**Checkout** uses Shopify cart permalinks (`koffeely.co/cart/<variantId>:<qty>`), so it opens Koffeely's real checkout. **WhatsApp orders** go to +92 329 2016132 with the order pre-filled. Forms are demo-only and don't send anything.

All 26 images are local WebP files with descriptive names, about 1.2 MB in total, taken from Koffeely's own product photos.

**Hosting:** GitHub Pages at https://mariya-haque.github.io/koffeely-redesign/. Pushing to `main` redeploys. Every page is `noindex` and `robots.txt` blocks crawlers, so the concept never competes with koffeely.co in search.
