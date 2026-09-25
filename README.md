# VeltrixDB — Marketing Site

Static multi-page site. No build step — plain HTML + shared assets.

## Run it locally

It is plain HTML: double-click `index.html` and it opens in Chrome, Safari or Firefox with
every page, style and link working — no build, no server.

The exception is an editor's built-in preview (e.g. VS Code), which shows the page inside
a frame. There Chrome treats each `file://` page as its own origin and blocks loading
between them ("Unsafe attempt to load URL file:///… from frame …"), so the page can
appear unstyled or links do nothing. Open it in a real browser, or serve the folder:
`python3 -m http.server 8000` and open http://localhost:8000/.

## Structure

| Page | Content |
|---|---|
| `index.html` | Landing: two-column hero (positioning headline + static quickstart terminal), measured YCSB stats (conditions in tooltips/captions), illustrative RAM-vs-NVMe cost split (labelled), outcomes, engine-in-30s strip, measured read-latency distribution, docs strip, CTA. Uses `assets/home.css` + `assets/home.js` |
| `product.html` | The pain (illustrative scenarios), comparison table (no competitor latencies), architecture (3D pipeline, mechanism-only path steps), engine deep-dive (KV separation; off-heap index; Unreleased engine work incl. the experimental `--net` front-end), use cases, deploy targets, honest requirements |
| `performance.html` | Measured benchmarks, live cluster dashboard, active R&D |
| `pricing.html` | Open source ($0) / engineering support (contact) / managed service (planned, not available) + static node-sizing rules. The old tier-priced calculator was removed (it priced a managed service that does not exist); its `#calc` anchor now holds the sizing section |
| `faq.html` | FAQ accordion (no RESP, no managed service, no certifications — stated plainly), resource cards, origin story |
| `whitepaper.html`, `redis-comparison.html`, `blog-*.html` | Long-form content |
| `docs/` | Product documentation subsite — 34 pages: getting-started, architecture, concepts, SDKs, operations, reference, Kubernetes, resources |

## Shared assets

- `assets/site.css` — design system for product / performance / pricing / FAQ. Layered: a dark base
  palette, the light theme that flips it, then the **v4 polish layer at the end of the file** — the one
  place the look is tuned (type, accent, section rhythm, cards, tables, buttons, mobile guards)
- `assets/home.css` — the homepage's own stylesheet, with a matching v4 layer at the end
- `assets/longform.css` — loaded after the inline `<style>` of the long-form pages (whitepaper,
  redis-comparison, blog-*) to bring them onto the same system
- `docs/assets/docs.css` — docs subsite, same v4 layer at the end
- `assets/site.js` — all interactivity; every feature is element-guarded, so one file serves every page
- `assets/home.js` — homepage interactivity (terminal re-typing, scroll reveal, copy button)
- three.js is loaded only on `index.html` and `product.html` (3D hero / pipeline / globe)

## Design system (v4)

- **Type:** Manrope for everything, JetBrains Mono only for code, commands and data (metric names,
  terminal). Every page links the same Google Fonts URL; no Newsreader, no DM Sans.
- **Accent:** one blue (`#0B5CFF`). The highlighted words in headings (`.em`) use it at the heading's
  own weight — never a serif italic.
- **Labels:** small sans caps (11.5px, weight 700, ~.07em tracking). Letterspaced mono is not a UI label style.
- **Surfaces:** white canvas, deep-indigo hero/footer/terminals, 16px radius cards with one border
  and a quiet shadow.
- **Motion:** scroll-reveal only for content that starts below the fold (`site.js` checks position
  first), everything disabled under `prefers-reduced-motion`.
- **Mobile:** no page may be wider than the viewport. Grid children get `min-width:0`, long tokens
  wrap, tables scroll inside their wrapper. Check with a real 390px viewport (headless Chrome's
  `--window-size` cannot go below 500px, so emulate the device).

## Interactive components (all in assets/site.js, element-guarded)

- **Architect fit check** (`product.html#fitcheck`) — 5-question qualifier with an honest
  strong-fit / caveats / wrong-tool verdict; the disqualifiers mirror what we say on demo calls
- **Latency chart** (`performance.html`) — hover tooltips with source notes, Chart/Table toggle
  (the table doubles as the accessible view); palette validated for CVD + contrast on the dark surface
- **Sticky section subnav** with scrollspy on `product.html` and `performance.html`
- **Copy-to-clipboard** benchmark command in the performance CTA
- **Docs live search** (`docs/assets/docs.js`) — Cmd/Ctrl+K, filters the sidebar client-side
- **Hero terminal** (`index.html`) — the quickstart session (docker run → `nc` PUT/GET/PING) is written in the
  HTML with the server's real log line and replies, so it reads correctly with JS off; `home.js` re-types those
  same lines once when the terminal scrolls into view (skipped under `prefers-reduced-motion`). Copy button included
- **Mobile menu** — hamburger disclosure on ≤760px (nav links were previously just hidden)

## Conventions

- Every page shares the same nav (active item underlined) and footer — edit them in ALL pages when changing links
- Performance claims must be measured numbers (YCSB run in the main repo); no projected figures.
  Unverified figures (the internal GKE run) are always labeled as such — in docs too. Nothing at "1 billion keys"
  has been measured reproducibly; cost comparisons are illustrative list-price arithmetic and say so
- Features on the unreleased branch (native index, binary WAL, `--net`, opt-in io_uring bridge) carry an "Unreleased" label
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
