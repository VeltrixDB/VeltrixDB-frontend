# VeltrixDB — Marketing Site

Static multi-page site. No build step — plain HTML + shared assets.

## Structure

| Page | Content |
|---|---|
| `index.html` | Landing: two-column hero (headline + live terminal quickstart), measured stats, outcomes, engine-in-30s strip, benchmark teaser, docs strip, CTA |
| `product.html` | The pain, comparison table, architecture (3D pipeline), engine deep-dive, use cases, deploy targets, honest requirements |
| `performance.html` | Measured benchmarks, live cluster dashboard, active R&D |
| `pricing.html` | Tiers + interactive cost calculator |
| `faq.html` | FAQ accordion, resource cards, origin story |
| `whitepaper.html`, `redis-comparison.html`, `blog-*.html` | Long-form content |
| `docs/` | Product documentation subsite — 34 pages: getting-started, architecture, concepts, SDKs, operations, reference, Kubernetes, resources |

## Shared assets

- `assets/site.css` — the entire design system (dark theme, DM Sans / JetBrains Mono / Newsreader, red accent)
- `assets/site.js` — all interactivity; every feature is element-guarded, so one file serves every page
- three.js is loaded only on `index.html` and `product.html` (3D hero / pipeline / globe)

## Interactive components (all in assets/site.js, element-guarded)

- **Architect fit check** (`product.html#fitcheck`) — 5-question qualifier with an honest
  strong-fit / caveats / wrong-tool verdict; the disqualifiers mirror what we say on demo calls
- **Latency chart** (`performance.html`) — hover tooltips with source notes, Chart/Table toggle
  (the table doubles as the accessible view); palette validated for CVD + contrast on the dark surface
- **Sticky section subnav** with scrollspy on `product.html` and `performance.html`
- **Copy-to-clipboard** benchmark command in the performance CTA
- **Docs live search** (`docs/assets/docs.js`) — Cmd/Ctrl+K, filters the sidebar client-side
- **Hero terminal** (`index.html`) — typed quickstart session (docker run → PUT/GET) with copy button;
  types on scroll-into-view, renders instantly under `prefers-reduced-motion`
- **Mobile menu** — hamburger disclosure on ≤760px (nav links were previously just hidden)

## Conventions

- Every page shares the same nav (active item underlined) and footer — edit them in ALL pages when changing links
- Performance claims must be measured numbers (YCSB run in the main repo); no projected figures.
  Unverified figures (the internal GKE run) are always labeled as such — in docs too
- Each page answers ONE question; don't repeat a section across pages — link to it instead
- All motion is compositor-only and disabled under `prefers-reduced-motion` (3D scenes, counters, bar fills)
- `sitemap.xml` lists every public page — update it when adding one

## Docs subsite conventions

- Shared chrome lives in `docs/assets/docs.css` + `docs/assets/docs.js`; every page ships its own
  static sidebar (relative links per directory depth) with `class="active"` on the current page
- `docs.js` derives breadcrumbs and the prev/next pager from the sidebar at runtime — adding a page
  to every sidebar is all that's needed for it to join the reading order
- Live search (Cmd/Ctrl+K) filters the sidebar client-side; code blocks get copy buttons automatically
- Content is code-verified against the main repo (CHANGELOG / ARCHITECTURE.md / source) — when a
  release ships, update: data-model, wire-protocol, deployment-modes, server-configuration,
  admin-api, limitations-and-roadmap, and the version pill (34 pages)
