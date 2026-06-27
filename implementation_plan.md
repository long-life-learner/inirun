# INI RUN FEST 2026 — Results & Podium App

Vanilla HTML/CSS/JS + Three.js race results web app for INI RUN FEST 2026 (28 Juni, AEON Mall Deltamas). Maroon-red + gold brand. Read-only backend: PHP + MySQL. No framework, no build step.

---

## User Review Required

> [!IMPORTANT]
> **Scope confirmed by AGENTS.md:** No React/Vue, no bundler, no PHP framework, no ORM. Final deploy = static files + flat PHP endpoints. Ponytail full mode is a perfect fit here — the docs already mandate minimal stack.

> [!IMPORTANT]
> **Data isn't available yet.** Race finishes 28 June 2026. Dummy data will be used for dev/demo. Real import happens via `import_csv.php` post-race.

> [!WARNING]
> **Logo assets are reference images only** (logo.jpg, color.jpg). AGENTS.md §9 explicitly says: use a clear `[LOGO SPONSOR]` placeholder for Gulf+ and INI org logo until vector assets are supplied by the committee. I'll reconstruct the INI RUN FEST wordmark in pure CSS/SVG from the reference images for the hero, but sponsor logos remain placeholders.

---

## Open Questions

> [!IMPORTANT]
> **Where does this live on disk?** AGENTS.md §3 defines `inirunfest-app/frontend/` and `inirunfest-app/backend/`. The workspace root is `inirun.idlaps.com/`. Should I create `frontend/` and `backend/` **inside** `inirun.idlaps.com/`, or should that directory *be* the root (i.e., `inirun.idlaps.com/index.html` directly)?

> [!IMPORTANT]
> **Race categories final?** PRD lists 5K, 10K, Half Marathon — but says "sesuai kategori final yang dirilis panitia". I'll scaffold all three in dummy data; you can drop any before import.

> [!NOTE]
> **GSAP vs manual lerp?** AGENTS.md recommends GSAP for podium animation. Ponytail says: avoid new deps if a few lines cover it. I'll use `THREE.Clock` + manual lerp/easing for all transitions — removes one CDN dep, no measurable quality loss for this scene. Say so if you want GSAP.

---

## Proposed Changes

### Phase 1 — Project Scaffold + Design Tokens

#### [NEW] `frontend/css/tokens.css`
All CSS custom properties from DESIGN.md §10 — colors, typography, spacing, radius, shadows, gradients.

#### [NEW] `frontend/css/base.css`
Reset, Google Fonts link (Anton, Inter, Roboto Mono), typography base, native element defaults.

#### [NEW] `frontend/css/layout.css`
Navbar (sticky, maroon-700, logo left / nav right), footer (logo + sponsor placeholder), container/grid utilities.

#### [NEW] `frontend/css/components.css`
Buttons (primary gold, secondary outline, ghost), badges, cards, chip filters — all using tokens.

#### [NEW] `frontend/css/results.css`
Search bar, filter chip row, results table (zebra striping, rank accent borders, mono time column), pagination, loading skeleton, empty/error states.

#### [NEW] `frontend/css/podium.css`
Canvas wrapper, HTML label overlays (positioned over 3D), category selector bar, reset-view button, fallback-2D cards, share button.

---

### Phase 2 — Backend (PHP + MySQL)

#### [NEW] `backend/schema.sql`
Exact DDL from AGENTS.md §4.2 — `results` table with indexes.

#### [NEW] `backend/config/db.php`
PDO connection, reads from `backend/config/.env` via `parse_ini_file`.

#### [NEW] `backend/config/.env.example`
`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` template.

#### [NEW] `backend/api/results.php`
`GET ?category=&gender=&search=&page=&limit=` → paginated JSON array. Whitelist-validates `category`/`gender`, prepared statements, camelCase output.

#### [NEW] `backend/api/categories.php`
`SELECT DISTINCT category, gender` → JSON array for filter chips.

#### [NEW] `backend/api/podium.php`
`GET ?category=&gender=` → exactly 3 rows (rank 1–3), fast via `idx_rank_category_gender`.

#### [NEW] `backend/scripts/import_csv.php`
CLI script: `php import_csv.php results.csv`. Reads CSV, `TRUNCATE` + bulk insert with prepared statements. Tolerant column mapping (handles extra/missing columns gracefully).

---

### Phase 3 — Frontend JS Infrastructure

#### [NEW] `frontend/js/config.js`
`API_BASE_URL` constant (relative path for same-origin hosting, overridable for dev).

#### [NEW] `frontend/js/api/client.js`
`fetchResults({category, gender, search, page})` and `fetchTopThree(category, gender)` — native `fetch()`, JSDoc typed.

#### [NEW] `frontend/js/utils/format.js`
`escapeHtml()`, `formatTime()`, `formatPace()`.

#### [NEW] `frontend/js/utils/webgl-check.js`
`isWebGLAvailable()` — 5 lines, from AGENTS.md §6.9.

#### [NEW] `frontend/js/utils/share-image.js`
Canvas capture → composite with event overlay → PNG blob → download. Two presets: 1:1 and 9:16.

#### [NEW] `frontend/js/components/navbar.js`
`renderNavbar(container)` — injects sticky nav HTML, active-link detection from `location.pathname`.

#### [NEW] `frontend/js/components/footer.js`
`renderFooter(container)` — sponsor placeholder + INI org info.

---

### Phase 4 — Results Page

#### [NEW] `frontend/results.html`
Semantic HTML, imports `results-page.js` as `type="module"`, importmap for Three.js (not needed here — only on podium page).

#### [NEW] `frontend/js/results/results-page.js`
Entry point: init navbar/footer, wire search + filter → `fetchResults` → `renderResultsTable`. Handles loading/error/empty states. Pagination (prev/next page buttons → `page` param to API).

#### [NEW] `frontend/js/results/table-render.js`
`renderResultsTable(tbody, data)` — uses `<template>` + `cloneNode` + `textContent` only. Rank 1–3 rows get `data-rank` attribute for CSS gold/silver/bronze accent.

#### [NEW] `frontend/js/results/search.js`
Debounced (300ms) input handler → dispatches `CustomEvent('filterChange')`.

---

### Phase 5 — Podium 3D Page

#### [NEW] `frontend/podium.html`
Canvas container + `#podium-fallback` div + category/gender `<select>` + Reset View button. Loads `podium-page.js` as `type="module"` with importmap pointing to Three.js (CDN ESM or `vendor/`).

#### [NEW] `frontend/js/podium/podium-page.js`
Entry point: WebGL check → `initPodiumScene` or `renderFallback2D`. Wires category selector → `fetchTopThree` → `updatePodiumData`.

#### [NEW] `frontend/js/podium/fallback-2d.js`
`renderFallback2D(container, topThree)` — 3 bib cards (gold/silver/bronze styling from §6.5 DESIGN), pure HTML via `<template>`.

#### [NEW] `frontend/js/podium/category-selector.js`
Populates `<select>` from `fetchCategories()`, fires `change` event.

#### [NEW] `frontend/js/three/scene.js`
`initPodiumScene(container)` — WebGLRenderer (antialias, alpha, preserveDrawingBuffer), PerspectiveCamera fov=47, ResizeObserver, render loop with `requestAnimationFrame`, proper `dispose()`.

#### [NEW] `frontend/js/three/podium-geometry.js`
3 `BoxGeometry` blocks (height ratio 3:2:1.5), `MeshStandardMaterial` maroon, canvas-texture numbers "1"/"2"/"3" in gold Anton. Floor plane with subtle reflection. Tepi gold edge via thin `BoxGeometry` strips.

#### [NEW] `frontend/js/three/lighting.js`
AmbientLight #3A0000, DirectionalLight key (warm white, castShadow), PointLight rim gold × 3.

#### [NEW] `frontend/js/three/controls.js`
`OrbitControls` config: polar angle clamped 50°–85°, zoom bounds, pan disabled on mobile, `userInteracted` flag for idle-orbit pause.

#### [NEW] `frontend/js/three/animations.js`
Manual lerp with `THREE.Clock`. Entrance: camera dolly + podium scale-Y stagger (Juara 3→2→1). Idle orbit. Category transition: scale-out → data swap → scale-in. No GSAP.

#### [NEW] `frontend/js/three/confetti.js`
`THREE.Points` 100 particles, gold+white, ~2s lifetime, auto-dispose after play.

---

### Phase 6 — Hero / Landing Page

#### [NEW] `frontend/index.html`
Hero section with `--gradient-hero` background, CSS-reconstructed wordmark "INI RUN FEST 2026" (Anton font, white + gold accent on "FEST"), event date/location, 2 CTA buttons. Yellow runner motif SVG inline. Navbar + footer. Sponsor placeholder section.

---

### Phase 7 — Individual Result Card (opsional MVP+)

#### [NEW] `frontend/js/results/bib-card.js`
Modal/dialog opening on table row click: renders bib card from row data (BIB, name, category, time, rank), share button via `share-image.js`. Implements `<dialog>` native element — no modal library needed.

---

## Verification Plan

### Automated Tests
- `php -S localhost:8080 -t frontend/` — serve frontend locally
- Dummy data: insert 100 rows via a quick `INSERT` script for dev
- Open `index.html`, `results.html`, `podium.html` — verify no console errors
- Force WebGL disabled in Chrome flags → verify fallback 2D renders
- Resize to 360px width → no horizontal overflow
- Check `EXPLAIN` on `results.php` query with `category + gender` filter → index hit

### Manual Verification
- Podium entrance animation plays correctly on page load
- Category selector swap triggers crossfade transition
- Search debounce works (type "budi" → waits 300ms → fetches)
- Share button produces valid PNG download in Chrome + Safari
- All text gold on maroon passes WCAG large-text contrast (≥3:1 large, ≥4.5:1 body)
- Meta OG tags present in all 3 HTML files
