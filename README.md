# Bandwidth Atlas: PCIe Speed Explorer

An interactive, single-page reference to PCI Express bandwidth (Gen 1 to 7, lane
widths ×1 to ×32), compared with USB, HDMI, Ethernet, Wi-Fi and RAM (DDR1 to DDR6)
on one scale.

A connector, a protocol, a signaling rate, and real application throughput are
not the same thing. Every number on the site says which of these it is.

## Features

- **PCIe explorer**: two independent links (generation × lane width). Per-lane,
  one-way and bidirectional figures update as you change the controls. A ratio
  strip compares the two links (with a swap button) and states the basis of
  the comparison. A protocol-overhead slider (0-40%, with quick presets and
  spec-derived typical values per family) shows what sustained payload looks
  like after protocol overhead.
- **Lane visualizer**: an original SVG of parallel full-duplex lanes that follows
  the Link A width control.
- **Shareable state**: the explorer, cross-standard comparison and active
  filter live in the URL hash, so any view can be copied as a link.
- **Machine-readable data**: `data.json` (all rates, meanings, caveats, source
  IDs) is generated from the typed data model at build time, and `llms.txt`
  points to it.
- **Light and dark themes**: follows the OS preference, with a persistent
  toggle in the header (`?theme=light|dark` also works); print stylesheet
  included.
- **Cross-standard comparison**: any two standards against each other (for
  example DDR5 vs PCIe 4.0 x16), with clickable overhead presets that apply
  each family's typical default, and a unit switch (MB/s, GB/s, Gbps, TB/s).
- **Comparison chart and table**: USB, HDMI, Ethernet, Wi-Fi and RAM (JEDEC
  DDR1-6) on a logarithmic scale (10 Mbps to 1 Tbps), with per-category filters
  (each with an inline SVG icon and row count). Each row says what the number
  measures, its directionality and its status. Future items (PCIe 6.0/7.0,
  DDR6) are labeled "Future, not released".
- **Prerendered HTML**: the build step renders the page in headless Chromium
  and serializes the DOM into dist/index.html, so first paint needs no
  JavaScript (fast LCP, works with JS off, indexable); the script then swaps
  in the interactive version.
- **Worked examples**: NVMe Gen 4 ×4, GPU ×16, a scale check against 10GbE, USB
  and USB4, and a file-transfer time calculator. Sizes are decimal GB and the
  result is labeled an idealized lower bound, not a benchmark.
- **Glossary, methodology, sources**: plain-English terms, the exact calculation
  formulas, a "Data checked" date, and citations to standards bodies (PCI-SIG,
  USB-IF, HDMI Forum, IEEE, Wi-Fi Alliance, JEDEC).

Dark-navy design, system fonts, no external requests, no cookies or tracking,
keyboard-accessible controls, `prefers-reduced-motion` respected, usable at
320 px wide.

## Stack

Vite, vanilla TypeScript (strict), Vitest, ESLint and Prettier. Zero runtime
dependencies. The site is one page of DOM updates over pure calculation
functions, so no framework is needed. `puppeteer-core` plus system Chromium
drive the headless UI smoke test.

## Local development

Node.js 20.19 or newer (22.x recommended).

```bash
npm install              # dev dependencies
npm run dev              # dev server on http://localhost:5173
npm run build            # production build to dist/ (base /)
BASE_PATH=/my-repo/ npm run build   # build for a subpath
npm run preview          # serve the production build
```

## Verification

```bash
npm run check            # prettier --check + eslint + tsc --noEmit + vitest
npm run build            # production build (includes prerender into dist/index.html)
npm run smoke            # headless Chromium UI test of the build (74 checks)
npm run smoke /my-repo/  # same, for a subpath build
npm run lighthouse       # Lighthouse CI: perf >= 95, a11y >= 95, seo >= 95, BP >= 85
```

`smoke` and the build-time prerender start `vite preview` on port 4173 and
expect Chromium at `/usr/bin/chromium` (override with `CHROME_PATH`; the CI
lighthouse job uses the runner's Chrome the same way). The PR workflow runs
`check` and `lighthouse` on every pull request.

## Data and sources

All reference values live in typed modules, not components:

- `src/data/standards.ts`: PCIe generations and every interface rate, each with
  rate kind, directionality, status, caveat and source ids.
- `src/data/sources.ts`: the source registry.
- `src/lib/pcie.ts`, `format.ts`, `logscale.ts`: pure, unit-tested math.

Model rules:

- Decimal SI units only: `1 GB = 1,000 MB`, `1 GB/s = 8 Gbps`.
- Gen 1 to 2: `GT/s × (8/10) ÷ 8` per lane per direction (8b/10b).
  Gen 3 to 5: `GT/s × (128/130) ÷ 8` (128b/130b).
- Gen 6 and 7 (PAM4/FLIT): nominal ceilings from PCI-SIG published x16
  bidirectional maximums (256 GB/s Gen 6, 512 GB/s Gen 7). The NRZ formulas do
  not apply to PAM4 generations.
- One-way and bidirectional aggregates are always shown separately, and every
  value is a specification ceiling tagged with what it measures.
- Sources are standards bodies and first-party documents only. Unverified
  figures and real-world benchmark numbers are omitted on purpose.

## GitHub Pages deployment

Status: code and workflow are committed and pushed. Deployment activates after
the one-time settings step below.

`.github/workflows/deploy.yml` uses the official `actions/configure-pages`,
`actions/upload-pages-artifact` and `actions/deploy-pages` flow. It runs on
pushes to the default branch (detected at runtime, not hard-coded) and on
manual dispatch.

One-time setup (repository owner):

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. If the site should be public: Settings → General → Danger Zone → Change
   repository visibility → Public. A private repo has no public URL.
3. Watch the run in Actions under "Build and deploy to GitHub Pages".

Live URL: `https://<owner>.github.io/<repo>/`.

Base path (handled by the workflow automatically, and locally via `BASE_PATH`):

| Setup                                         | Base       |
| --------------------------------------------- | ---------- |
| Project site `<owner>.github.io/<repo>/`      | `/<repo>/` |
| User or organization site `<owner>.github.io` | `/`        |
| Custom domain (detected via the Pages API)    | `/`        |

The build includes a `404.html` for unknown URLs.

## Layout

```
index.html                    page shell + metadata
public/favicon.svg, 404.html  icon; Pages 404 page
src/main.ts                   app assembly (hero, header, footer, wiring)
src/styles.css                design system
src/data/standards.ts         all reference values (typed)
src/data/sources.ts           source registry
src/lib/pcie.ts               pure PCIe/transfer math (+ tests)
src/lib/format.ts             display rounding (+ tests)
src/lib/logscale.ts           log-scale math (+ tests)
src/components/               explorer, lanes, compare, examples,
                              glossary, sources
scripts/smoke.mjs             headless-browser UI smoke test
.github/workflows/deploy.yml  GitHub Pages CI
```
