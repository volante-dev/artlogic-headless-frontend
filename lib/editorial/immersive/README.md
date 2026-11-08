# Editorial immersive contract v1

This contract applies to editorial article blocks (publications, news, exhibitions), not page-composer sections. Citations remain rich-text content.

Every block definition in `registry.ts` must expose actual `ClassicView` and `ImmersiveView` components, a `createViews` function, native inner overflow, exactly three distinct validated appearance descriptors and a default belonging to that triplet. Unsupported client overrides must not inherit the generic attestation. Keep article, block and slide identity stable across translations and reordering.

`ViewContext` supplies the view phase, direction, optional text/media panel, execution mode, stable active state, suspension and media preparation demand. `preparing` starts the bounded image availability clock without enabling playback. Only a stable active, live, non-suspended view can play video or rotate a carousel. Register scoped motion targets and scroll hosts; acquire an idempotent suspension lease before opening any overlay, including its loading/error states, and release it on every close/unmount path. Native fullscreen retains its own player controls while article navigation is suspended.

Navigation is a state machine: ready → preparing → transitioning → ready. Images get a shared 1500 ms preparation budget. Missing images become a local retryable error by 10000 ms, never an unbounded transition. Epochs discard stale completions. A physical gesture owns either inner reading or article navigation until it ends; reaching an inner boundary never hands its momentum to the next section. Explicit timeline selection may replace a pending target. Reduced motion resolves immediately with the same final content and controls.

GSAP timelines run inside scoped `useGSAP` lifecycle cleanup, without React updates per frame. Animations have closed code-owned values; authors select IDs, not durations or scripts. Carousel reveal controls appear after the frame has finished revealing. Do not hide native SSR content before enhancement. If the reader has already scrolled/focused a later section, retain native flow; animation failure returns to the current block. The render kill switch uses the classic reader and never mutates stored choices. With JavaScript completely disabled, a noscript link opens the canonical article with `?reader=native`: a complete simplified HTML response serialized only from the authorized public projection. Keep `lib/editorial/native-reader.ts` exhaustive when adding a family; this path has no scripts/iframes and uses restrictive CSP and private/no-store headers.

For a new block or client implementation:

1. Extend canonical backend document/public schemas and the family catalogue; regenerate DTOs.
2. Implement both renderers, view projection, overflow, suspension and all three reduced-motion-safe appearances.
3. Extend registry conformance, projection, gesture, accessibility and interaction scenarios. Review the visual effects.
4. Run `pnpm editorial:manifest`, commit both generated artifacts, then `pnpm editorial:check`. The build refuses stale/incomplete profile declarations. The generated capability is an admission artifact, not a substitute for browser or physical-device validation.

The API contribution gate defaults closed (`EDITORIAL_IMMERSIVE_ENABLED=false`). Frontend rendering defaults enabled (`EDITORIAL_IMMERSIVE_RENDER_ENABLED=true`); these gates are independent. New local UI messages use `lib/i18n/editorial-immersive.ts`, never the global site-content catalogue, so historical translations/logos require no provision or seed.

## Useful viewport and bounded media

Use `--editorial-view-height` / `--editorial-content-height` supplied by the reader, which subtract the actual header and the view padding. Do not put `100vh`/`100svh` inside an immersive section. Generic images, carousels and players fit a bounded canvas including captions and controls. Opening taxonomies belong inside the same opening composition. Short content must not create a scrollable view; genuinely long text/captions keep native inner scroll hosts. Run `tests/editorial-immersive-geometry.spec.ts` for desktop, portrait and landscape after every renderer override.

## Image groups

`imageGroup` covers diptych/triptych: one nonempty immersive view, equal desktop columns, and the existing controlled carousel below900px. Keep the gallery state above its responsive child; key by block identity, never locale. Zero survivors omit the view; one survivor has no navigation. Use the shared axis-aware gesture classifier and retain its instance across slide transitions.

Approved appearances are group-fade900ms, group-reveal1700ms and group-zoom-out1400ms, controls included. Classic entrance uses the scoped `useImageGroupAppearance`; immersive entrance belongs only to the article orchestrator. Three distinct validated appearances remain mandatory for every editorial family. Reduced motion is immediate; failed animation and `?reader=native` retain reading.

Stretch desktop grid items through the definite frame height: `align-items:start` collapses size-contained figures to80px. Geometry tests must check actual image height, not merely absence of overflow. Use the reader’s useful height once; reserve safe areas in overlay controls. Long bounded captions are keyboard-focusable inner scroll hosts. Zoom stays disabled in immersive mode.

Production capability fingerprints include the group component, hook, motion factory, state helper, carousel/controller and CSS. They do not participate in persisted site provisioning fingerprints. See feature014 review documents for actual automated and pending hardware evidence.
