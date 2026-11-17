# Store product drawer

Mode: Experience, with an explicit purchase action.
Scope: a narrow extension of the existing Store and artwork viewing language. The gallery visual world and its older build state are preserved.
Primary target: components/commerce/ProductDialog.tsx
Related targets: ProductDialog.module.css, ProductCard.tsx, Store.module.css, CartProvider.tsx, components/privacy/Consent.module.css.

## Approved direction

The user chose A (Immersion) after viewing three comps, then requested a beautiful expansion of the lower Détails block and progressive arrival of both dark surface and blur. Approved comp: ../mocks/product-dialog/a-immersion.png; approval stored in its JSON sidecar and brief.json. No new brand, concept seed or gallery redesign is part of this work.

The drawer enters from the right, exactly60vw on desktop and100vw on mobile,100dvh high. The site behind it remains in the same document with its header intact, smoothly dimmed and blurred. Authentic supplied product photography leads. A native horizontal carousel uses dots when more than one photo exists; a single real photo does not invent pagination. The lower square glass block contains the title, contributor, price, tax label and purchase control. Détails expands this same continuous surface upward, reveals the details body after a bounded delay, increases dark strength and blur, and reverses on close. Long details scroll inside their own reading area. Reduced motion and keyboard access remain supported.

The listing loses its add-to-cart control and opens the drawer from the image or Détails. Cart validation, price authority, availability and stock rules remain unchanged. A successful add closes the drawer before revealing the cart confirmation. No API/schema/database change is needed.

## Quality bar

- At1440×1000: drawer x576, width864, height1000, flush to top/right/bottom. Inner margins use the existing square gallery grammar. Title and purchase rows align without inherited global header padding.
- At390×844: drawer x0, width390, height844. Compact purchase stays inside the viewport. No horizontal page overflow. Ten carousel dots fit in one row.
- Collapsed glass:62% inverse surface,10px blur. Expanded glass:82%,16px blur. User-requested continuous darkening replaces any opacity reset. Progressive drawer backdrop:0→8px; reverse on exit.
- Consent uses the same square frosted inverse material and equal prominent accept/reject buttons, with44px hit targets. Measured height68px desktop and143px mobile, down from the larger former panel. No unsupported claim of a statutory pixel minimum.
- All products, photos, prices and copy come from existing data. The Storybook repeated-photo/long-copy cases are explicitly synthetic. The source photo provenance is .storybook/public/commerce/forever.json.

## Evidence and limits

Screenshots: ../review/product-dialog/desktop.png, desktop-details.png, mobile.png, mobile-details.png, desktop-consent.png and mobile-consent.png. Measured browser geometry/material values: metrics.json in that folder.

Six actual-component interaction checks on Chromium/WebKit cover drawer geometry, details, scrolling, carousel, reduced motion and cart handover with local synthetic HTTP responses. The existing Storybook server requires an explicit JSON syntax adapter; it only removes its obsolete import assertion syntax. Next production build is checked independently. No live order, stock or transformation mutation is used.

This component has no new-world FORM seed or global gallery machine comp-diff score. The existing October gallery state is unrelated and was not reset or represented as product evidence. Visual review is scoped to the approved component comp and inspected screenshots; it does not attest completion of that unrelated build.
