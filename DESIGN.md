---
name: Projection — Artlogic public gallery
description: An immersive gallery world with restrained type, clear controls, and open artwork layouts.
colors:
  background: "#F6F7F6"
  surface: "#FFFFFF"
  muted-surface: "#E7EAE8"
  inverse-surface: "#101314"
  text: "#101314"
  muted-text: "#48544F"
  inverse-text: "#F6F7F6"
  disabled-text: "#66716C"
  accent: "#3C554A"
  on-accent: "#FFFFFF"
  link: "#304E40"
  link-hover: "#183C2B"
  border: "#64736A"
  focus: "#21623F"
  selection: "#365B48"
  on-selection: "#FFFFFF"
  error: "#9F2424"
  on-error: "#FFFFFF"
  success: "#286341"
  on-success: "#FFFFFF"
  warning: "#725600"
  on-warning: "#FFFFFF"
typography:
  h1:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(2rem, 1.5158450704225352rem + 2.0657276995305165vw, 3.375rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0em"
  h2:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(1.5rem, 1.147887323943662rem + 1.5023474178403755vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0em"
  h3:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(1.25rem, 1.073943661971831rem + 0.7511737089201878vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0em"
  body:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(1rem, 0.9559859154929577rem + 0.18779342723004694vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  caption:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(0.875rem, 0.875rem + 0vw, 0.875rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  navigation:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(0.875rem, 0.8309859154929577rem + 0.18779342723004694vw, 1rem)"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  button:
    fontFamily: '"site_hanken_grotesk", sans-serif'
    fontSize: "clamp(0.875rem, 0.8309859154929577rem + 0.18779342723004694vw, 1rem)"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  square: "0px"
spacing:
  space-4: "4px"
  space-8: "8px"
  space-12: "12px"
  space-20: "20px"
  space-24: "24px"
  space-28: "28px"
  space-32: "32px"
  space-40: "40px"
  space-48: "48px"
  space-64: "64px"
  section-inline: "clamp(24px, 5vw, 80px)"
  section-block: "clamp(64px, 8vw, 128px)"
  section-following: "clamp(32px, 4vw, 64px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "10px 18px"
  button-disabled:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.disabled-text}"
    rounded: "{rounded.square}"
  menu-button-inverse:
    backgroundColor: "transparent"
    textColor: "{colors.inverse-text}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "10px 18px"
  text-link:
    textColor: "{colors.link}"
    typography: "{typography.body}"
  text-link-hover:
    textColor: "{colors.link-hover}"
  navigation:
    typography: "{typography.navigation}"
  hero-link:
    textColor: "{colors.inverse-text}"
  playback-control:
    backgroundColor: "transparent"
    textColor: "{colors.inverse-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.square}"
    padding: "0px"
  artwork-card:
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
  artwork-image:
    backgroundColor: "{colors.muted-surface}"
    rounded: "{rounded.square}"
---

# Design System: Projection — Artlogic public gallery

## Overview

**Creative North Star: "Projection — le film avant tout"**

Projection gives the artwork room to hold attention. Dark, immersive media and a compact invitation establish the opening; pale editorial surfaces, measured typography, and generous gaps carry the visitor into the collection. Navigation and controls stay visible without becoming the subject.

The public gallery uses a flat, square, restrained vocabulary. Imagery supplies texture and color; interface depth comes from contrast and protected reading zones. The default identity is a configurable starting point for each gallery: typography and color roles stay coherent when their assigned values change.

**Key Characteristics:**

- Immersive media with a compact invitation and visible playback controls.
- A restrained sans-serif hierarchy and underlined text actions.
- Open artwork layouts, square geometry, and generous spacing.
- Pale editorial surfaces following the dark first viewport.
- Theme roles shared by CSS and MUI, with explicit mobile and media fallbacks.

This record covers the implemented public template and its client extension as inspected on 28 October 2026. Its source of truth is `clients/default/projection.json`, `clients/demo-gallery/`, `clients/registry.ts`, `branding/`, `app/globals.css`, the public shell, `components/ui/`, `sections/`, `page-composer/`, and `.storybook/`. The spacing names above describe repeated CSS values; they are documentation tokens, not an existing CSS variable scale. Color slugs correspond to the camel-case runtime variables, for example `muted-surface` maps to `--site-color-mutedSurface`.

The supplied final finish review returned **ship**, with no material defect across 19 captures in `.impeccable/review/`: `desktop.png`, `mobile.png`, `user-375.png`; administration identity/pages/media/publication at 1440 and 375; profiles 0/1 at desktop/mobile; and Storybook immersive hero and image-left text/image at 1440 and 375. `final-detect.json` is empty for the supplementary review. Composition C remains the reference, with contrast and configurable-font adaptations expressly accepted on 27 October. This documentation compares the implementation sources with that reported evidence; it does not repeat the review or infer acceptance of uncaptured combinations.

The direction is an extension of the existing Projection world. The formal five-block direction contract was not supplied; the final reviewer used a replacement role contract because no reviewer role was preloaded. The Projection film remains a still image encoded as a four-second MP4, and the sculpture, catalogue tiles, and Storybook media are identified demonstration fixtures. Production-film quality and human task timings remain unmeasured. Execution evidence and its limits live in `../backend/specs/003-configurable-frontend-template/validation.md`. The separate administration shell retains its established Arial/teal visual system; its tokens are not public gallery defaults.

## Colors

The default palette pairs cool pale surfaces and charcoal with muted forest-green actions. The frontmatter records the default preset; all 22 color roles can be configured through the administration and consumed by the public CSS/MUI adapter. The `demo-gallery` editorial preset changes only the background to warm paper (`#F3F0E8`); this client value does not replace the generic frontmatter palette.

The sidecar's eight-step OKLCH ramps are generated swatch aids. They are not additional runtime palette tokens or approved client theme values.

### Primary

- **Forest accent** (`accent`, `on-accent`): filled actions and their foreground.
- **Deep green links** (`link`, `link-hover`): textual navigation within editorial content, with a darker hover state.
- **Green focus and selection** (`focus`, `selection`, `on-selection`): keyboard location and selected text, independent of decorative imagery.

### Neutral

- **Gallery paper** (`background`): the public page and continuous editorial canvas.
- **White surface** (`surface`): the MUI paper role; the inspected artwork cards do not use separate white panels.
- **Muted backing** (`muted-surface`): image placeholders and disabled controls.
- **Projection charcoal** (`inverse-surface`, `text`): the media fallback, protected menu surface, and ordinary text.
- **Inverse paper** (`inverse-text`): text and controls over the dark media treatment.
- **Muted green-grey** (`muted-text`, `disabled-text`): secondary artwork information and disabled states.
- **Structural grey-green** (`border`): header, footer, and editorial-list dividers.

Error red, success green, warning ochre, and their `on-*` foregrounds are bound to MUI semantic roles. They are state colors, not extra editorial accents; no status-message presentation is established by the supplied home captures.

**The Role Pair Rule.** Use the foreground and background roles together; a client palette change must preserve the contrast pairs declared in `page-composer/definitions.ts`.

**The Protected Media Rule.** Keep the inverse text roles and the implemented dark reading supports together whenever text or controls overlay media. A legible poster alone does not establish legibility for a replacement film.

## Typography

**Display and body font:** Hanken Grotesk, served as `site_hanken_grotesk` with a sans-serif fallback. The generic Projection preset uses it for all seven configurable roles. The `demo-gallery` editorial preset assigns Source Serif 4 (`site_source_serif_4`, serif fallback) to `h1`, `h2`, and `h3`, retaining Hanken Grotesk for body, caption, navigation, and button. This is an installed client example, not the generic default display/body pairing. Static WOFF2 faces are selected by role, weight, and style, with `font-display: swap`. `public/fonts/catalog.json` records the bundled faces and hashes; each family retains its `LICENSE` and `provenance.json` under `public/fonts/`. Preserve those records when extending the catalogue.

The character is calm and direct. Headings use regular weight, while navigation and buttons gain only a modest weight increase. The hierarchy uses independently configured fluid sizes rather than a single mathematical scale ratio; the frontmatter preserves the exact clamps emitted by the theme adapter.

| Runtime role | Use | Size range | Weight / line height |
| --- | --- | --- | --- |
| `h1` | Main page heading and hero invitation | 2–3.375rem | 400 / 1.05 |
| `h2` | Section heading | 1.5–2.5rem | 400 / 1.2 |
| `h3` | Artwork and editorial title | 1.25–1.75rem | 400 / 1.2 |
| `body` | Prose, artwork metadata, normal links | 1–1.125rem | 400 / 1.5 |
| `caption` | Captions and media-control labels | 0.875rem | 400 / 1.5 |
| `navigation` | Main destinations | 0.875–1rem | 500 / 1.5 |
| `button` | Button labels | 0.875–1rem | 500 / 1.5 |

Prose is limited to 70ch. Ordinary headings balance their lines and cap at 28ch. The hero deliberately overrides balancing, respects explicit line breaks, and uses a compact measure of 13ch, increasing to 14ch on mobile. Its action uses the body size multiplied by 1.11. The textual logo fallback is uppercase (1.25rem, weight 500, tracking 0.25em); the footer name uses lighter tracking (0.12em). Those logo treatments do not extend to prose or buttons. Active navigation adds underlining and weight 600; the language selector has a separate 0.95rem size.

**The Shared Role Rule.** Extend the existing typography roles through the theme adapter; preserve each component's hierarchy and responsive measure when a gallery chooses a different family.

## Layout

Public composed pages occupy the full width. Editorial sections center within 1440px and use the fluid inline and block spacing in the frontmatter. Adjacent sections reduce the next top padding through `section-following`. Narrow text and stacked contact variants cap the outer section at 900px. The fallback page shell retains its separate 1200px maximum.

The header places the home/logo link at the left and six destinations plus languages at the right. Its inset is `clamp(24px, 3.28vw, 64px)`, with 20px vertical padding. At 1099px and below, navigation becomes an explicit menu; opened links stack, languages remain available, and the immersive menu has a solid inverse surface. The footer wraps its name and description naturally, with 40px block padding and the editorial inline inset.

The immersive hero has a minimum height of 100svh. Media fills it with `object-fit: cover` and the configured focal point. Composition C places the invitation at the lower left and groups the pause/explore controls at the lower right. Desktop padding is `72.5svh 3.4% 11svh`; the invitation is at most half the width or 650px. At 767px and below, the invitation takes the available width, with `55svh 24px 180px` padding and controls 60px from the bottom. This space is part of the control separation, not an invitation to place unrelated content in the hero.

| Pattern | Wide layout | Responsive behavior |
| --- | --- | --- |
| Section grids | Three equal columns; 64px row and 32px column gaps | Two columns at 950px, with 40px/24px gaps; one at 500px |
| Artwork catalogue | Configured column count, default three; 48px row and 32px column gaps | Two columns at 950px; one at 600px |
| Text/image and split contact | Two equal columns; gap `clamp(32px, 6vw, 96px)` | One column at 767px, 32px gap; image order returns to source order |
| Editorial list | One-third image, two-thirds text; 40px gap and top spacing | One column at 767px |
| Horizontal strip | Columns `minmax(240px, 35%)`, 32px gap, native horizontal overflow | 85% columns and 24px gap at 767px |
| Artwork detail | Image/information tracks `1.6fr` and `minmax(240px, .7fr)`; 64px gap | Gap 32px at 950px; stacked at 600px, with a two-column definition list |

Horizontal strips use proximity scroll snap and keyboard focus. Section anchors keep a 32px scroll margin. The page scroll remains native.

## Elevation & Depth

The public world uses tonal contrast and imagery rather than elevated cards. MUI buttons explicitly disable elevation and ripple. Artwork cards remain flat at rest and on hover. Borders separate the footer, non-immersive header, and editorial-list rows; they are not a blanket ban on lines.

The immersive header has a vertical gradient using 72% inverse surface before fading to transparent. A second gradient protects the lower hero reading band: it starts at 55% of the hero on desktop and 35% on mobile, then reaches the same 72% mix. These are readability treatments. The hero edge rule and control separator use inverse text at 25% and 30% respectively.

**The Flat Surface Rule.** Preserve the existing flat cards and square actions; use spacing, contrast, and the implemented dividers to express hierarchy.

## Shapes

The shared corner radius is square. Images, action outlines, and media controls use rectilinear geometry; the pause icon sits in a 50px square with a 2px stroke. Generic artwork media uses a 4:3 backing and `object-fit: contain`, preserving the complete work. The registered `demo-gallery` card uses a portrait 4:5 backing while retaining containment. Editorial images have their own cover behavior and maximum height of 80svh; they should not silently replace the catalogue's containment rule.

Focus outlines sit outside the control. The ordinary treatment is 3px in the focus role with a 4px offset; inverse header controls use 2px in the current foreground with a 4px offset, and hero actions use a 6px offset. These focus indicators are distinct from shadows.

## Components

### Buttons and text actions

Buttons are square and quiet, with a minimum height of 44px. The generic MUI button defaults to a filled accent action, uses the button typography role, and has 10px/18px padding. Its hover uses MUI's generated primary-dark value; the sidecar reads `--gallery-palette-primary-dark` rather than treating it as a new editable site color. Disabled buttons use the muted surface and disabled-text roles. The inherited MUI color transitions take 250ms; no custom page-entry animation is established.

The menu button is an outlined variant with inherited foreground and transparent background. Hover adds an 8% foreground wash. Ordinary editorial links are underlined, use link/link-hover roles, and have a 0.2em underline offset. Section actions provide a 44px target and 8px top margin. Existing non-MUI fallback buttons retain 12px/18px padding and the link-hover background on hover; they are not a second branded button family.

### Navigation

Desktop links wrap as needed with 20px horizontal spacing; each has a minimum height of 44px. Current destinations receive a 2px underline and weight 600. The language list uses slash separators, with an underline and stronger weight for the active language. Mobile exposes a labeled open/close button; Escape closes the menu and restores focus. The header stays an ordinary page region, not a modal drawer. A keyboard-reachable skip link precedes it.

### Hero media and controls

The compact invitation, underlined discovery action with an inline SVG arrow, square playback icon, and separate downward explore action form the signature composition. The playback target is at least 51px wide and 79px tall; explore is at least 58px wide. Hover underlines the control label. Icon strokes are SVG, not typographic glyphs.

The hero keeps its poster and accessible actions when playback is unavailable. Playback is muted, looping, and inline; it suspends when offscreen or the document is hidden. Reduced-motion preference starts it paused until the visitor explicitly plays it, and a manual pause persists across temporary suspension. The controls reflect native playback events. The optional demo notice identifies fixture content and is not an editorial eyebrow pattern.

### Artwork cards and detail

An artwork card is a linked image followed by a title and muted artist metadata, without a panel border, shadow, or internal card padding. Catalogue frames use cover cropping in both the generic and client profiles, following the user’s 29 October request. The title sits 18px below the image and 6px above metadata; hover underlines the title. Missing media uses a muted 4:3 placeholder, with a 220px minimum height. Detail images preserve their proportions and cap at 75vh; information uses a definition list with caption-style labels and generous separation.

### Client extension

The finite registry in `clients/registry.ts` resolves the generic components and overlays the selected client implementation without a frontend fork. The `demo-gallery` artwork card retains the linked, flat composition, uses a 4:5 image area, and places the caption inside 20px block padding with a bottom divider. Its title has 8px bottom spacing; optional year and medium use the caption role. Hover underlines the title; keyboard focus uses the shared focus color with a 5px offset. The profile does not change the generic card or promote its serif pairing into the global default.

### Editorial sections

The closed registry supplies nine predefined section types: hero media, text, text/image, artwork selection, editorial cards, image gallery, contact, catalogue, and artwork detail. The eight editorial/data sections share the section spacing vocabulary. The editor chooses supported variants and content rather than inventing section markup. Editorial grid cards remain open compositions. The list variant uses top dividers; gallery and selection strips use native scrolling. Captions sit 12px below images in muted text. Contact is a heading/body plus destination links; the inspected public implementation has no contact input form, chip system, or custom dialog to document. Empty sections use localized muted text, and failed images retain a visible localized placeholder.

### Component catalogue

Storybook exposes 60 examples using the actual public providers and views, with independent theme, component-profile, French/English locale, and 375px/1440px canvas controls. It runs with local synthetic fixtures and no backend or SSO dependency. Its immersive hero and image-left text/image captures support those specific compositions; the broader executed checks are recorded in the validation ledger. The catalogue's fixtures and demonstration labels are not client content or new brand rules.

### Footer

The footer is a simple baseline-aligned, wrapping row with a top divider. The site name uses the navigation family and restrained uppercase tracking; the description uses the caption role and a 60ch limit.

## Do's and Don'ts

### Do:

- **Do** use the configured color and typography roles in both CSS and MUI.
- **Do** keep readable inverse text supports and visible playback controls over media.
- **Do** preserve square, flat controls and open artwork layouts.
- **Do** fill catalogue image frames with cover cropping, following the user’s 29 October decision; preserve an explicit whole-image examination path in the artwork detail.
- **Do** keep keyboard focus, the mobile menu, language choices, and fallback content usable.
- **Do** identify synthetic demonstration material until gallery-owned content replaces it.

### Don't:

- **Don't** introduce rounded card shells or raised button shadows into the default Projection world.
- **Don't** hard-code the default font or palette into new public components outside the role system.
- **Don't** treat Source Serif 4 as the active default pairing or prescribe the demo sculpture's colors as interface tokens.
- **Don't** use playback or animation as a prerequisite for reaching the artworks.
- **Don't** promote demo labels, mock artist data, or inherited starter-page styles into reusable brand conventions.
- **Don't** mix the administration shell's Arial/teal tokens into the public gallery or infer production-film quality from demonstration captures.
