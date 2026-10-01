# koffeely.co: website review

Checked on the live site on 1 October 2026. There are 25 issues, listed most urgent first. The redesign in this folder fixes all of them.

## Broken or unfinished
1. **Shopify demo text is live.** Recipes and #CrazyKoffeeClub both open with "We make things that work better and last longer."
2. **Recipes and #CrazyKoffeeClub are the same page.** Neither has real content, and there are no recipes.
3. **Menu links go to the wrong pages.**
   - "#CrazyKoffeeClub" opens Shop.
   - "About Us" opens a blog list called "News".
   - The footer's "Contact us" opens the legal contact-info page instead of the contact form.
4. **The refund policy still says "[INSERT RETURN ADDRESS]".** It's a clothing template ("unworn, with tags") and contradicts itself: it offers 30-day returns, then says there are no refunds.
5. **There's no shipping policy.** `/policies/shipping-policy` is a 404. Delivery time, charges and COD aren't explained anywhere.
6. **Typo:** the recipes page is at `/pages/recepies`, titled "Recepies – Koffeely".
7. **The founder's surname doesn't match.** The post says "Mahnoor Rajput" but is signed "Mahnoor Sagheer".
8. **The tumbler page shows the wrong images:** two "Skincare Face Cream" template graphics and a blurry 200×300 thumbnail.
9. **Product data is messy.**
   - "The  Midori Ritual Kit" has a double space in its name.
   - Its description calls it a "Starter Kit".
   - Matcha's compare-at price equals its price.
   - One product is tagged "Uncategorized".
   - No product has a type set.

## Search and sharing
10. **The homepage title and meta/OG description are just "Koffeely".**
11. **The share image is a thin 500×171 logo,** so WhatsApp and Instagram link previews look empty.
12. **The homepage has three H1s.** The main one is "ABOUT KOFFEELY CO."
13. **No structured data** (Product, Organization, FAQ). Google can't show prices or ratings.
14. **Every photo of a product has the same alt text** (the product name). On the chasen page it appears 15 times.
15. **File names come straight from a camera roll** (`IMG_6032.jpg`, `image00001.jpg`), and the favicon is `WhatsApp_Image_2025-10-07…jpg`.
16. **The blog URL contains an emoji:** `/blogs/news/%E2%98%95meet-mahnoor-…`.

## Lost sales
17. **No WhatsApp ordering or chat button.**
18. **Judge.me is installed but no reviews or stars show.** The "Customers Love our products" block looks empty.
19. **The best story is buried in one blog post:** Pakistan's first instant coffee brand, founded at 20, with 5% of every order going to Gaza relief.
20. **The hero copy is generic.** "Unmatched versatility — quick, convenient, and made for you" could describe any product.
21. **No sets or upsells.** Matcha isn't paired with the chasen, and there's no second-jar offer.
22. **The sold-out tumbler is still promoted on the homepage,** with no way to get a restock alert.
23. **Contact details are hidden** on an unlinked page, and the contact email is a Gmail address rather than an @koffeely.co one.

## Speed
24. **The homepage hero autoplays a 1080p, 7.2 Mbps video,** even on mobile data.
25. **The homepage is heavy:** about 330 KB of HTML, 83 script tags, and apps loading from 8 or more outside domains (6 for Judge.me alone).

## Owner to confirm before launch
- Delivery cities, timing and charges, and any free-delivery threshold
- Whether cash on delivery is available
- Which founder surname to use (Rajput or Sagheer)
- A return address, and a refund policy rewritten for food products
- Permission to show Judge.me reviews and tagged Instagram posts
