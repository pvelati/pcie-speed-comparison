# Bandwidth Atlas — PCIe Speed Explorer

An interactive, single-page, English-language reference that explains **PCI Express
bandwidth across generations (Gen 1–7) and lane widths (×1–×32)** and places those
figures beside **USB, HDMI, Ethernet and Wi-Fi** on an honest scale.

> A connector, a protocol, a signaling rate, and real application throughput are
> not the same thing. This site keeps those concepts separate everywhere.

## Features

- **Interactive PCIe explorer** — two independently configurable links (generation ×
  lane width) with instant, always-correct figures: raw GT/s, encoding family, per-lane
  and link bandwidth one-way, plus the bidirectional aggregate shown separately.
  A comparison strip shows the ratio between the two links on a clearly stated basis.
- **Lane visualizer** — original SVG diagram of parallel full-duplex lanes that follows
  Link A's width control, with an accessible text alternative.
- **Comparison chart & table** — USB, HDMI, Ethernet and Wi-Fi reference rates on a
  **logarithmic** scale (10 Mbps → 1 Tbps stays readable), with decade gridlines,
  per-row "what this number measures" + directionality + status, a fully accessible
  data table, and roadmap items (e.g. 1.6 Tb/s Ethernet) kept visually separate from
  ratified standards.
- **Practical examples** — NVMe Gen 4 ×4, GPU ×16 (Gen 4/5), a scale check against
  10GbE/USB/USB4, and an interactive file-transfer time calculator (decimal GB,
  labeled as an idealized lower bound, not a benchmark).
- **Glossary** — plain-English definitions of lane, GT/s vs Gbps, GB/s vs Gbps,
  8b/10b and 128b/130b encoding, PAM4, FLIT/FEC, full duplex vs aggregate, PHY rate
  vs goodput, and connector vs protocol vs cable.
- **Methodology & sources** — every figure is computed from a typed data module and
  cited to standards bodies (PCI-SIG, USB-IF, HDMI Forum/LA, IEEE, Wi-Fi Alliance)
  with a visible "Data checked" date.

Design: dark-navy engineering field guide, system fonts only, no external requests,
no cookies or tracking, keyboard-accessible controls, `prefers-reduced-motion`
respected, usable at 320 px wide.

## Stack (and why)

- **Vite + vanilla TypeScript (strict)** — the site is one page of DOM updates driven
  by pure calculation functions; a framework would add weight without adding value.
- **Vitest** — unit tests for the calculation core (no DOM needed).
- **ESLint + Prettier + `tsc`** — quality gates, all run in CI.
- **puppeteer-core + system Chromium** — headless smoke test that clicks the real UI.

Zero runtime dependencies. Everything (data, visuals, fonts) is local.

## Local development

Requires Node.js ≥ 20.19 (22.x recommended).

```bash
npm install        # install dev dependencies
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build to dist/ (base: /)
BASE_PATH=/my-repo/ npm run build   # build with a subpath base
npm run preview    # serve the production build
```

## Verification commands

```bash
npm run format:check   # Prettier
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit (strict)
npm test               # Vitest unit tests (calculation core)
npm run check          # all of the above
npm run build          # production build
npm run smoke          # headless Chromium smoke test of the built site
                       # (starts `vite preview` on port 4173; needs Chromium at
                       # /usr/bin/chromium — override in scripts/smoke.mjs if needed)
npm run smoke /my-repo/   # smoke test the subpath build
```

## Data sources and policy

All reference values live in typed modules, not in components:

- `src/data/standards.ts` — PCIe generations (raw GT/s, encoding family, calculation
  notes) and every external interface rate (kind, directionality, status, caveat,
  source ids).
- `src/data/sources.ts` — the authoritative source registry.
- `src/lib/pcie.ts` — pure calculation functions (encoding formulas, lane scaling,
  one-way vs bidirectional, transfer times).
- `src/lib/format.ts` — display rounding (no false precision).

Rules enforced by the data model:

- Decimal SI units only: `1 GB = 1,000 MB`, `1 GB/s = 8 Gbps`.
- PCIe Gen 1–2: `GT/s × (8/10) ÷ 8` per lane per direction (8b/10b).
- PCIe Gen 3–5: `GT/s × (128/130) ÷ 8` (128b/130b).
- PCIe Gen 6–7 (PAM4/FLIT): nominal ceilings derived from PCI-SIG's published x16
  bidirectional maximums (256 GB/s Gen 6, 512 GB/s Gen 7) — the NRZ formulas are
  deliberately **not** applied to PAM4 generations.
- One-way and bidirectional aggregate values are always computed and displayed
  separately.
- Every displayed value is a **specification ceiling**, tagged with what it measures
  (signaling / link / PHY / theoretical) and its directionality. Roadmap items are
  never mixed into ratified lists.
- Primary sources are standards bodies and first-party documents only (see the
  Sources section on the page; the "Data checked" date is shown there).

Values intentionally omitted: anything without an authoritative source, and real-world
benchmark numbers (the site shows theoretical ceilings; a benchmark would be
hardware-specific and quickly stale).

## GitHub Pages deployment

The repository ships with `.github/workflows/deploy.yml` using the official
`actions/configure-pages` → `actions/upload-pages-artifact` → `actions/deploy-pages`
flow. It triggers on pushes to the repository's default branch (detected at runtime —
the branch name is not hard-coded) and on manual dispatch.

**One-time setup (repository owner):**

1. GitHub → **Settings → Pages → Build and deployment** → set **Source** to
   **GitHub Actions** (wording may evolve; it is the only source option that uses the
   workflow). No other Pages configuration is needed.
2. Push to the default branch (or run the workflow from Actions → "Build and deploy
   to GitHub Pages" → Run workflow).
3. The deployment summary reports the live URL.

**Base-path handling** (also done by the workflow, automatically):

- Project site `https://<owner>.github.io/<repo>/` → base `/<repo>/`
- User/organization site `<owner>.github.io` → base `/`
- Custom domain (detected via the Pages API in the workflow) → base `/`

The same logic works locally: `npm run build` uses the `BASE_PATH` environment
variable (default `/`), and `npm run smoke [base]` verifies a build under a subpath.
The built output contains a `404.html` that GitHub Pages serves for unknown URLs.

## Repository layout

```
index.html                  page shell + metadata
public/favicon.svg          original icon
public/404.html             GitHub Pages 404 page
src/main.ts                 app assembly (hero, header, footer, wiring)
src/styles.css              full design system
src/dom.ts                  tiny DOM builder
src/data/standards.ts       all reference values (typed)
src/data/sources.ts         source registry
src/lib/pcie.ts             pure PCIe/transfer math (+ tests)
src/lib/format.ts           display rounding (+ tests)
src/lib/logscale.ts         log-scale math for the chart (+ tests)
src/components/explorer.ts  interactive explorer (two links + ratio)
src/components/lanes.ts     lane visualizer (SVG)
src/components/compare.ts   tabs, log chart, data table, roadmap
src/components/examples.ts  worked examples + transfer calculator
src/components/glossary.ts  expandable terms
src/components/sources.ts   methodology + source list
scripts/smoke.mjs           headless-browser UI smoke test
.github/workflows/deploy.yml  GitHub Pages CI
```
