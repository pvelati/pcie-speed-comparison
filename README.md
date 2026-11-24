# Bandwidth Atlas — PCIe Speed Explorer

An interactive, single-page reference to **PCI Express bandwidth** (Gen 1–7, lane
widths ×1–×32), placed beside **USB, HDMI, Ethernet and Wi-Fi** on an honest scale.

> A connector, a protocol, a signaling rate, and real application throughput are
> not the same thing. The site keeps those concepts separate everywhere.

## Features

- **PCIe explorer** — two independent links (generation × lane width); per-lane,
  one-way and bidirectional figures update instantly, with a ratio strip on a
  clearly stated basis.
- **Lane visualizer** — original SVG of parallel full-duplex lanes that follows the
  Link A width control.
- **Comparison chart & table** — all four external families on a **logarithmic**
  scale (10 Mbps → 1 Tbps), each row labeled with what the number measures, its
  directionality and its status; roadmap items (1.6 Tb/s Ethernet) kept separate
  from ratified standards.
- **Worked examples** — NVMe Gen 4 ×4, GPU ×16, a scale check vs 10GbE/USB/USB4,
  and a file-transfer time calculator (decimal GB, labeled as an idealized lower
  bound — never a benchmark).
- **Glossary, methodology and sources** — plain-English terms, the exact
  calculation formulas, a "Data checked" date, and citations to standards bodies
  (PCI-SIG, USB-IF, HDMI Forum, IEEE, Wi-Fi Alliance).

Dark-navy field-guide design. System fonts, zero external requests, no cookies or
tracking, keyboard-accessible, `prefers-reduced-motion` respected, usable at 320 px.

## Stack

Vite + vanilla TypeScript (strict) + Vitest + ESLint/Prettier. Zero runtime
dependencies — the site is one page of DOM updates over pure calculation functions,
so a framework would add weight without value. `puppeteer-core` + system Chromium
drive the headless UI smoke test.

## Local development

Node.js ≥ 20.19 (22.x recommended).

```bash
npm install              # dev dependencies
npm run dev              # dev server → http://localhost:5173
npm run build            # production build → dist/ (base /)
BASE_PATH=/my-repo/ npm run build   # build for a subpath
npm run preview          # serve the production build
```

## Verification

```bash
npm run check            # prettier --check + eslint + tsc --noEmit + vitest
npm run build            # production build
npm run smoke            # headless Chromium UI test (51 checks) of the build
npm run smoke /my-repo/  # same, for a subpath build
```

`smoke` starts `vite preview` on port 4173 and expects Chromium at
`/usr/bin/chromium` (path configurable in `scripts/smoke.mjs`).

## Data and sources

All reference values live in typed modules, not components:

- `src/data/standards.ts` — PCIe generations + every interface rate, each with
  rate kind, directionality, status, caveat and source ids.
- `src/data/sources.ts` — the authoritative source registry.
- `src/lib/pcie.ts` / `format.ts` / `logscale.ts` — pure, unit-tested math.

Model rules:

- Decimal SI units only: `1 GB = 1,000 MB`, `1 GB/s = 8 Gbps`.
- Gen 1–2: `GT/s × (8/10) ÷ 8` per lane per direction (8b/10b).
  Gen 3–5: `GT/s × (128/130) ÷ 8` (128b/130b).
- Gen 6–7 (PAM4/FLIT): nominal ceilings from PCI-SIG's published x16 bidirectional
  maximums (256 GB/s Gen 6, 512 GB/s Gen 7) — NRZ formulas deliberately **not**
  applied to PAM4 generations.
- One-way and bidirectional aggregates are always separate; every value is a
  specification ceiling, tagged with what it measures.
- Sources are standards bodies / first-party documents only. Unverified figures
  and real-world benchmark numbers are intentionally omitted.

## GitHub Pages deployment

**Status:** code and workflow are committed and pushed. Deployment activates after
the one-time settings step below.

`.github/workflows/deploy.yml` uses the official
`actions/configure-pages` → `actions/upload-pages-artifact` → `actions/deploy-pages`
flow; it runs on pushes to the default branch (detected at runtime, not hard-coded)
and on manual dispatch.

**One-time setup (repository owner):**

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. (If the site should be public) **Settings → General → Danger Zone →
   Change repository visibility → Public** — a private repo has no public URL.
3. Watch the run in **Actions → "Build and deploy to GitHub Pages"**.

Live URL: `https://<owner>.github.io/<repo>/`.

**Base path** (handled automatically by the workflow and locally via `BASE_PATH`):

| Setup                                      | Base       |
| ------------------------------------------ | ---------- |
| Project site `<owner>.github.io/<repo>/`   | `/<repo>/` |
| User/organization site `<owner>.github.io` | `/`        |
| Custom domain (detected via the Pages API) | `/`        |

A `404.html` ships in the build for unknown URLs.

## Layout

```
index.html                    page shell + metadata
public/favicon.svg, 404.html  original icon; Pages 404 page
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
