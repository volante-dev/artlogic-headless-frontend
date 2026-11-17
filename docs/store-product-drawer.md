# Product drawer and consent

The Store list opens a product drawer from its image or Détails action. Adding to the cart happens inside this drawer. The existing catalog, stock validation and cart API remain authoritative; this delivery adds no backend capability or database dependency.

The drawer occupies60% of the desktop viewport width and the full viewport below768px. Native MUI dialog behavior owns focus, Escape, background scroll locking and focus restoration. Opening and closing keep the same document and list position. Each opening starts at the first image with details collapsed.

A native scroll-snap carousel uses the public URLs and existing responsive variants provided with the product. The first two images load eagerly when the drawer opens; remaining images retain browser lazy loading. Dots appear only for multiple images, without arrows. No new Supabase transformation is requested by the UI.

The approved glass composition expands upward for Détails. GSAP reveals the reading area, then its content, while dark strength and blur progress together. Price and purchase stay available. Reduced motion removes entrance and reveal movement; keyboard detail toggles settle immediately. Long descriptions scroll inside the reading area. The main drawer backdrop progressively blurs/dims and reverses on close. A successful cart validation closes the drawer before opening the cart confirmation anchored to its existing trigger.

Consent retains its existing categories, receipts and storage behavior. The compact inverse-glass banner preserves clear equal accept/reject controls,44px targets, preferences access and bilingual copy. It has no fixed claim of a legally required pixel height.

## Verification

-6 product/consent interaction checks across Chromium and WebKit, including mobile long text, carousel, reduced motion and cart handover using local synthetic responses.
-6 cart/routing/profile unit checks in3 files.
- TypeScript, lint and Next production build. Existing Next version security advisory remains a separate dependency concern.
- Desktop1440×1000 and mobile390×844 captures: exact864px desktop drawer / full mobile width, no horizontal overflow, consent68px /143px for the fixture copy.
- Independent Impeccable review: ship at component scope, no material fixes. No global gallery build-state completion or machine comp-diff score is claimed.

Browser checks live in `tests/storybook/product-dialog.spec.ts` and use `playwright.storybook.config.ts`, independently from application E2E. The existing local Storybook/Vite server emits obsolete JSON assertions; `E2E_STORYBOOK_JSON_COMPAT=true` enables the explicit import-syntax-only adapter for that server. Production is built independently by Next. No live order or stock changes are part of this recipe.

Delivery uses `staging` and `lucasratton-preview-frontend`. The public frontend on `main` is unchanged. Rollback is a frontend commit rollback; cart storage and APIs remain compatible.
