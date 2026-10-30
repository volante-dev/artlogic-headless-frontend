# Synthetic fixtures

These binaries are local copies of the reproducible synthetic fixtures from backend/mock/fixtures/presentation (demo-mobile.webp and demo-film.mp4). Geometric test images and a short silent test film; no actual artwork, artist attribution or gallery media. UUID filenames deliberately exercise the same-origin media paths of the production components. Storybook never calls the backend. The static harness detects WebP/MP4 signatures for their response types. These copies make the frontend repository independently buildable.

Gallery005 also uses native-generated, explicitly fictional glass, limestone and patinated-bowl photographs. Source PNGs with embedded prompts are in public/demo/gallery; UUID501–506 and510–516 are byte-identical copies for same-origin component paths. No Artlogic, session or preview endpoint is used.
