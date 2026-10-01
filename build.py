"""Sync the shared header/footer into every page.

Edit partials/header.html or partials/footer.html, then run:  python build.py
Pages stay plain HTML and open directly in a browser without this step.
"""
import pathlib, re

root = pathlib.Path(__file__).parent
parts = {n: (root / "partials" / f"{n}.html").read_text(encoding="utf-8").strip() for n in ("header", "footer")}

for page in sorted(root.glob("*.html")):
    html = page.read_text(encoding="utf-8")
    for name, body in parts.items():
        if name == "header":
            # mark the current page in the nav
            body = body.replace(f'<a href="{page.name}">', f'<a href="{page.name}" aria-current="page">')
        html = re.sub(rf"<!-- {name}:start -->.*?<!-- {name}:end -->",
                      f"<!-- {name}:start -->\n{body}\n<!-- {name}:end -->", html, flags=re.S)
    page.write_text(html, encoding="utf-8")
    print("synced", page.name)
