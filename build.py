"""Sync the shared header/footer into every page, and rebuild review.html.

Edit partials/header.html, partials/footer.html or pitch.html, then run:  python build.py
Pages stay plain HTML and open directly in a browser without this step.
"""
import pathlib, re

root = pathlib.Path(__file__).parent
parts = {n: (root / "partials" / f"{n}.html").read_text(encoding="utf-8").strip() for n in ("header", "footer")}

for page in sorted(p for p in root.glob("*.html") if p.name not in ("pitch.html", "review.html") and not p.name.startswith("_")):
    html = page.read_text(encoding="utf-8")
    for name, body in parts.items():
        if name == "header":
            # mark the current page in the nav
            body = body.replace(f'<a href="{page.name}">', f'<a href="{page.name}" aria-current="page">')
        html = re.sub(rf"<!-- {name}:start -->.*?<!-- {name}:end -->",
                      f"<!-- {name}:start -->\n{body}\n<!-- {name}:end -->", html, flags=re.S)
    page.write_text(html, encoding="utf-8")
    print("synced", page.name)

# review.html: standalone copy of pitch.html (artifact format, no doctype) for the hosted site.
pitch = (root / "pitch.html").read_text(encoding="utf-8")
cut = pitch.index("</style>") + len("</style>")
head, body = pitch[:cut], pitch[cut:].replace('href="demo/', 'href="')
review = "\n".join([
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="robots" content="noindex, nofollow">',
    head.strip(),
    "</head>",
    "<body>",
    body.strip(),
    "</body>",
    "</html>",
    "",
])
(root / "review.html").write_text(review, encoding="utf-8")
print("built review.html")
