# GOAL — PCIe & Connectivity Bandwidth Explorer

## Mission

Build a polished, educational, English-language website from an empty repository. The site explains PCI Express bandwidth across generations and lane widths, then places those figures beside familiar connectivity standards: USB, HDMI, Ethernet, and Wi-Fi. It should make the numbers intuitive through interactive sliders, side-by-side comparisons, visual scale, and practical examples.

The finished site will be hosted as a static website on **GitHub Pages**. It must work without a backend, database, server-side runtime, API keys, or paid services.

This is a product and implementation goal, not a request for a mock-up. Deliver a complete, working, tested, responsive website and its deployment configuration.

## 1. First actions and repository discipline

1. Inspect the repository, current branch, existing files, Git status, package manager, and available project instructions before changing anything.
2. The repository is expected to be empty, but do not assume this: preserve any existing files or conventions and do not overwrite user work.
3. If the repository contains `AGENTS.md`, `README.md`, contributor instructions, or CI configuration, read and follow them.
4. Make implementation decisions autonomously. Do not stop to ask for approval on ordinary design, architecture, copywriting, or implementation details.
5. Choose a minimal, maintainable static-site stack suitable for interactive controls and GitHub Pages. Prefer a small dependency surface. If no stack exists, use a conventional TypeScript-based static frontend (for example, Vite with React, or an equally suitable lightweight alternative). Do not introduce a backend.
6. Keep all specification data in a clearly separated, typed data module rather than scattering numeric constants through components.
7. Update the README with local development, build/test commands, data-source policy, and GitHub Pages deployment instructions.
8. Add a GitHub Actions workflow that builds and deploys the site to GitHub Pages. Configure the correct base path for a project repository, while also supporting a user/organization Pages repository and a custom domain. Do not assume the repository name or owner.
9. Do not claim deployment succeeded unless the workflow or deployment result confirms it. The deliverable in this task is a repository-ready site and workflow.

## 2. Product identity and visual direction

Create a distinctive visual identity. Avoid a generic SaaS dashboard, default component-library look, or an unstyled documentation page.

**Working title:** `Bandwidth Atlas`  
**Suggested page title:** `PCIe Speed Explorer — Understand Every Lane`  
The naming can be improved if a stronger, memorable title is found, but the site's purpose must remain immediately clear.

Design direction: a premium engineering field guide / interactive technical instrument. Use a restrained dark-ink or deep-navy foundation, crisp high-contrast typography, a warm neutral or near-black surface system, and a small number of precise accent colours (for example electric cyan and signal amber). Use subtle grid lines, lane traces, technical labels, fine borders, and carefully controlled motion. Avoid excessive gradients, glow effects, glassmorphism, stock imagery, and decorative clutter.

The site should feel authored and editorial:

- A strong hero with a clear promise and one immediately useful headline figure.
- Oversized, well-composed numeric typography for bandwidth values.
- Distinct visual treatment for PCIe lanes and external interfaces.
- Carefully designed comparison bars that remain readable over a very wide range of speeds.
- Good whitespace, deliberate alignment, consistent spacing, and clear hierarchy.
- Responsive layouts that feel designed for mobile, not merely squeezed down.
- Dark/light theme support is welcome, but do not sacrifice visual consistency or delivery quality to add it.

Use CSS, inline SVG, and/or small original diagrams for lane illustrations. Avoid requiring externally hosted images or fonts for core content. A system font stack or locally bundled, licensed fonts is acceptable. The complete experience must remain usable if external resources are blocked.

## 3. Intended audience and teaching principles

The audience ranges from curious PC users to technically experienced readers. Explain specialist terms the first time they appear. The site must be accurate without assuming the reader already understands GT/s, encoding, full-duplex links, lane width, or PHY rates.

The central educational message is:

> A connector, a protocol, a signaling rate, and real application throughput are not the same thing.

Never imply that all displayed numbers measure exactly the same thing. Every comparison must identify what the number represents and whether it is one-way, bidirectional aggregate, an advertised signaling/link rate, a PHY maximum, or a theoretical payload ceiling.

Use decimal SI units consistently:

- `1 byte = 8 bits`
- `1 GB = 1,000 MB`
- `1 GB/s = 8 Gbps`
- `Gbps` means gigabits per second.
- `GB/s` means gigabytes per second.
- `GT/s` means giga-transfers per second and is **not** automatically equal to Gbps. Explain the encoding/signaling context.
- Do not mix decimal GB with binary GiB in the same calculation. If GiB is shown, label it explicitly.

## 4. Required page structure and content

Build a single cohesive page with anchor navigation, or a small set of static routes if that materially improves the experience. A single-page experience is preferred.

### A. Hero — the scale of bandwidth

- Explain in one or two sentences what the explorer does.
- Show a memorable PCIe bandwidth figure with its context, for example: PCIe 7.0 x16 supports up to 512 GB/s bidirectionally (256 GB/s in each direction), according to PCI-SIG.
- Make the one-way versus bidirectional distinction visible, not hidden in a footnote.
- Include a clear call-to-action that scrolls to the interactive explorer.

### B. Interactive PCIe explorer — the main feature

This must be the visual centre of the site and fully functional.

Provide controls for:

- **PCIe generation:** Gen 1 through Gen 7.
- **Link width:** x1, x2, x4, x8, x16, and x32 where the selected generation/configuration supports it. If x32 is included, label it as an uncommon/optional width and do not imply it is a typical desktop slot. Do not silently treat the physical slot size as the electrical lane count.
- Use accessible range sliders, segmented controls, or selects. Sliders must have visible labels and current values. If the discrete lane choices do not map naturally to a range slider, use a segmented selector rather than a misleading continuous slider.

For the selected configuration, calculate and show:

- PCIe generation and raw signaling rate in GT/s.
- Signaling / encoding family (8b/10b, 128b/130b, or PAM4 with FLIT/FEC as appropriate).
- Lane count.
- Approximate per-lane bandwidth in one direction.
- Approximate link bandwidth in one direction.
- Bidirectional aggregate bandwidth, clearly identified as the sum of both directions.
- Equivalent values in Gbps and GB/s, with a readable unit switch if useful.
- A concise note about what is and is not included in the estimate.

The calculations must update immediately as controls move. Avoid page reloads and avoid stale output during rapid interaction.

Include a second independently configurable PCIe link so the reader can compare configurations (for example, Gen 4 x4 versus Gen 5 x8). Present both values and a meaningful ratio/difference without confusing one-way and full-duplex figures.

### C. Lane visualizer

Show what x1, x2, x4, x8, and x16 mean. Render an original visual with parallel lanes and directional arrows. The number of visible lane paths should change when the lane-width control changes.

Explain that:

- A lane is a full-duplex pair of differential signaling paths: one transmit direction and one receive direction.
- A link can negotiate fewer lanes or a lower generation than the physical slot/device maximum.
- A connector that is physically x16 may be wired for fewer lanes (for example, x8 or x4).
- The actual link is constrained by both endpoints, motherboard/CPU/chipset wiring, firmware, and platform topology.
- Generation compatibility does not guarantee that a device will run at its advertised maximum width or speed.

### D. Compare PCIe with external connectivity

Include a comparison section with interactive category filters or tabs for:

- USB
- HDMI
- Ethernet
- Wi-Fi

Display well-known versions/rates in an easy-to-scan visual chart and an accessible data table. Since the speeds span many orders of magnitude, use a logarithmic chart scale or another honest visualization that preserves visibility for slower interfaces. Explain the scale in the UI. Never use a linear bar chart that makes all slower technologies appear to be zero.

Each comparison item must include:

- Standard / generation name.
- Headline rate and unit.
- What the number represents (signaling rate, link rate, aggregate bandwidth, PHY rate, etc.).
- Directionality (one-way, full duplex per direction, asymmetric, or shared-medium PHY rate).
- A short note where it prevents a likely misunderstanding.
- A source link.

Provide at least the following reference set. Values are maximum or headline specification rates, not promises of application throughput:

**USB**

- USB 2.0: 480 Mbps.
- USB 3.2 Gen 1: 5 Gbps.
- USB 3.2 Gen 2: 10 Gbps.
- USB 3.2 Gen 2x2: 20 Gbps.
- USB4: 20 / 40 Gbps classes where relevant.
- USB4 Version 2.0: up to 80 Gbps; optional asymmetric mode up to 120 Gbps in one direction while retaining 40 Gbps in the other, for supported use cases.
- Explain that USB naming has changed repeatedly, USB-C is a connector shape rather than a speed guarantee, and USB4 can dynamically share bandwidth between tunneled protocols such as data and display.
- Do not collapse the 120/40 asymmetric mode into a misleading single symmetric 160 Gbps figure.

**HDMI**

- HDMI 1.4: 10.2 Gbps.
- HDMI 2.0: 18 Gbps.
- HDMI 2.1: 48 Gbps.
- HDMI 2.2: 96 Gbps (Ultra96).
- Clearly explain that HDMI is a high-speed display/audio signal path, not a general-purpose file-transfer interface. Its bandwidth figure must not be presented as directly equivalent to PCIe application data throughput.
- Mention that achievable resolution, refresh rate, chroma format, colour depth, and compression depend on the complete source/display/cable combination.

**Ethernet**

- Include consumer/common access rates: 10 Mbps, 100 Mbps, 1 GbE, 2.5 GbE, 5 GbE, and 10 GbE.
- Include higher-speed examples: 25, 40, 50, 100, 200, 400, and 800 GbE.
- Distinguish a network link's nominal rate from application goodput, and note that Ethernet is generally full duplex on modern switched links.
- Explain that media/PHY variants differ (twisted pair, fibre, backplane, DAC, etc.); the speed label alone does not identify the cable or reach.
- If showing 1.6 Tb/s or later roadmap items, put them in a visually separate **roadmap / emerging** group, never in the same list as ratified, deployed standards. Verify their status before including them.

**Wi-Fi**

- Include Wi-Fi 5, Wi-Fi 6/6E, and Wi-Fi 7.
- Include both a clearly labeled high-end PHY/theoretical maximum and at least one realistic client-class example where reliable sources are available. For example, Wi-Fi 7 can reach a headline theoretical multi-stream PHY rate around 46 Gbps under extreme 16-stream / 320 MHz conditions, while a 2x2 client example may be around 5.8 Gbps. Do not imply that a normal laptop or phone can achieve the 16-stream aggregate figure.
- Explain that real throughput depends on channel width, band, spatial streams, modulation, signal-to-noise ratio, distance, interference, client/AP capability, regulatory domain, and shared airtime.
- Explain that Wi-Fi is a shared wireless medium; do not present its PHY rate as a guaranteed per-client file-transfer speed.

### E. Practical examples — translate numbers into intuition

Include at least four worked examples that update from the underlying data model and use plain language. Examples should include:

1. A common NVMe-style PCIe configuration, such as Gen 4 x4, with its theoretical one-way link ceiling.
2. A GPU-style configuration, such as Gen 4 x16 or Gen 5 x16.
3. A comparison of PCIe Gen 3 x4 / Gen 4 x4 with 10GbE, USB 10/20Gbps, and USB4 40Gbps.
4. A large file-transfer illustration, such as the ideal minimum time to move 1 GB, 10 GB, or 100 GB at a selected theoretical rate.

For transfer-time calculations:

- Use decimal file sizes and explicitly state this.
- Use `time = bytes / bytes_per_second`.
- Label the result as an idealized lower bound based on the selected theoretical rate.
- Do not call the result a real-world benchmark or expected transfer time.
- Include a caveat that protocol overhead, storage speed, controller limits, CPU/DRAM, thermal throttling, and source/destination performance reduce real transfer rates.

Use illustrative real-world performance only when it is backed by a clear source and the hardware/configuration is identified. Never invent benchmark results.

### F. Explain the terms

Add a compact glossary or expandable explainers for:

- Lane / link width (x1, x4, x8, x16).
- GT/s versus Gbps.
- GB/s versus Gbps.
- Encoding efficiency (8b/10b and 128b/130b).
- PAM4.
- FLIT and FEC.
- Full duplex versus aggregate bidirectional bandwidth.
- PHY rate versus application throughput / goodput.
- Connector versus protocol versus cable capability.

Keep definitions short, approachable, and technically sound.

### G. Sources and methodology

- Provide a visible methodology section and a proper sources list with direct links to standards bodies and authoritative documentation.
- Cite each family of standards near the data it supports, not only in a footer.
- Show a “Data checked” date.
- Separate ratified standards, published specifications, theoretical maxima, vendor examples, and future roadmaps.
- Do not cite search-result pages, anonymous blogs, or AI-generated summaries as primary evidence.
- Do not use copied diagrams, logos, or product marketing artwork without permission. Create original CSS/SVG visuals.

## 5. Numerical model and calculation requirements

All data should live in a typed, auditable module, e.g. `src/data/standards.ts`. Use descriptive fields such as:

```ts
interface PcieGeneration {
  generation: number;
  label: string;
  rawRateGTs: number;
  encoding: string;
  perLanePerDirectionGBps: number;
  calculationNote: string;
  sourceIds: string[];
}

interface InterfaceRate {
  id: string;
  family: 'USB' | 'HDMI' | 'Ethernet' | 'Wi-Fi';
  label: string;
  rateGbps: number;
  rateKind: 'signaling' | 'link' | 'PHY' | 'theoretical';
  directionality: string;
  status: 'standard' | 'published-spec' | 'vendor-example' | 'roadmap';
  caveat?: string;
  sourceIds: string[];
}
```

Adapt the schema as needed, but preserve these distinctions in the model and rendered UI.

### PCIe reference model

Use these raw rates and encoding/signaling families:

| Generation |   Raw rate | Signaling / encoding      |
| ---------- | ---------: | ------------------------- |
| PCIe 1.x   |   2.5 GT/s | NRZ, 8b/10b               |
| PCIe 2.x   |   5.0 GT/s | NRZ, 8b/10b               |
| PCIe 3.x   |   8.0 GT/s | NRZ, 128b/130b            |
| PCIe 4.0   |  16.0 GT/s | NRZ, 128b/130b            |
| PCIe 5.0   |  32.0 GT/s | NRZ, 128b/130b            |
| PCIe 6.0   |  64.0 GT/s | PAM4, FLIT mode, FEC/CRC  |
| PCIe 7.0   | 128.0 GT/s | PAM4, FLIT-based encoding |

For Gen 1–2, calculate the encoded data ceiling per lane per direction as:

`GT/s × (8 / 10) ÷ 8 = GB/s`

For Gen 3–5, calculate it as:

`GT/s × (128 / 130) ÷ 8 = GB/s`

For Gen 6–7, use PCI-SIG's published x16 bidirectional maximums as the source of the nominal figures: 256 GB/s bidirectional for Gen 6 and 512 GB/s bidirectional for Gen 7. Divide by two for one direction, then by sixteen for the per-lane value. State clearly that this is a nominal specification-level ceiling and that FEC/FLIT framing and higher protocol layers mean application payload is lower. Do not apply the NRZ 8b/10b or 128b/130b formulas to PAM4 generations.

For every generation and selected lane count:

`oneWayGBps = perLanePerDirectionGBps × laneCount`

`bidirectionalAggregateGBps = oneWayGBps × 2`

`oneWayGbps = oneWayGBps × 8`

Display one-way and bidirectional aggregate values separately. Never call the bidirectional sum a one-way data rate.

**PCIe figures are theoretical link-level ceilings, not guaranteed application throughput.** For Gen 1–5, the formula accounts for line encoding but not every packet/protocol overhead. For Gen 6–7, use the official headline-derived nominal ceiling and explain FLIT/FEC overhead. The site must avoid false precision: round displayed values sensibly (e.g. two decimals, or three where needed to make a useful distinction).

### Current specification status

As of the research date (24 November 2026), PCI-SIG lists PCI Express Base Specification Revision 7.1 as the latest approved base-spec revision, while the generation's headline data-rate is still referred to as PCIe 7.0 / 128.0 GT/s. Explain that a spec revision number (for example 7.1) is not a new PCIe generation. Do not claim that PCIe 8.0 is finalized unless an authoritative source confirms it at implementation time.

## 6. Data integrity, comparison rules, and caveats

This is a teaching tool. Accuracy and clarity are more important than a high number of rows.

- Make units explicit beside every number.
- Use `GB/s` for byte rates and `Gbps` for bit rates. Do not use ambiguous `GBps`, `Gb/s` and `Gbps` interchangeably.
- Keep raw signaling rate, encoded/link bandwidth, PHY maximum, and application throughput as separate concepts.
- Clearly tag a value as one-way, per-direction full duplex, bidirectional aggregate, asymmetric, or shared-medium.
- When comparing unlike technologies, describe the comparison as a scale reference rather than declaring one interface universally “faster.”
- Do not calculate “X times faster” across two values with materially different measurement bases unless the UI explicitly states the basis and its limitations.
- Do not equate HDMI's video bandwidth with file-copy throughput.
- Do not equate Wi-Fi PHY rates with real client throughput.
- Do not equate USB-C connector shape with USB4 or any particular speed.
- Do not equate physical PCIe slot size with electrical lane count.
- Mention backward compatibility and link negotiation without implying every combination reaches the highest common spec rate in real platforms.
- Distinguish standards/specification ceilings from currently common consumer hardware. PCIe 7.0 and 800GbE can be shown as standard capabilities without implying they are commonplace in consumer PCs.
- Do not include unverified values or unsourced claims. If a figure is uncertain, label it as an estimate or omit it.

## 7. Interaction, accessibility, and responsive behaviour

The site must be genuinely usable, not just visually attractive.

- All controls must work with mouse, keyboard, and touch.
- Use semantic HTML and accessible names/labels for all sliders, selects, toggles, and buttons.
- Provide visible focus indicators and sufficient colour contrast.
- Do not encode meaning by colour alone; use labels, shapes, or text as well.
- Respect `prefers-reduced-motion`; avoid motion that is required to understand a value.
- Ensure charts and lane diagrams have an accessible text/table equivalent.
- Keep the page usable at 320px wide and at common laptop/desktop widths.
- Avoid horizontal overflow, especially in comparison tables.
- Make sliders and buttons large enough for touch interaction.
- Use responsive typography and layout; do not use tiny technical footnotes as the only place for critical caveats.
- Add sensible empty/error/fallback states if a visual component cannot render.

## 8. Engineering, maintainability, and quality gates

- TypeScript with strict settings if TypeScript is selected.
- Keep calculation logic pure and independently testable.
- Unit-test PCIe calculations, lane scaling, conversion functions, transfer-time calculations, and any comparison/normalization logic.
- Include tests for known values such as Gen 1 x1, Gen 3 x1, Gen 4 x4, Gen 5 x16, Gen 6 x16, and Gen 7 x16.
- Test that one-way bandwidth is exactly half of the bidirectional aggregate, subject only to display rounding.
- Test slider boundaries and each supported discrete lane width.
- Run formatter, linter, type checker, tests, and production build. Fix warnings and failures rather than hiding them.
- Keep dependencies minimal and explain any significant dependency.
- Do not add analytics, trackers, external APIs, cookies, or user-data collection by default.
- Do not place secrets in the repository or GitHub workflow.
- Use stable, accessible component patterns. Avoid a huge dependency for a simple chart if CSS/SVG is sufficient.
- Add metadata: descriptive page title, meta description, Open Graph/Twitter summary, favicon, and canonical URL only if the final public URL is known. Do not invent the deployment URL.
- Add a custom 404 page only if the chosen build/deployment setup supports it cleanly.

## 9. GitHub Pages delivery

The final repository must be ready for GitHub Pages deployment.

- Provide a GitHub Actions workflow using the official Pages artifact/deployment flow (or another current, documented GitHub-supported approach).
- Trigger on pushes to the repository's default branch and support manual dispatch.
- Set the minimum required Pages permissions and deployment environment correctly.
- Ensure Vite/static asset base paths work for `https://<owner>.github.io/<repo>/` and do not break local development. Also account for a user/organization site repository or a custom domain.
- Do not assume a branch named `main` if the repo's actual default branch differs; inspect it and configure accordingly.
- Include a README section explaining the one-time GitHub Pages setting: **Settings → Pages → Build and deployment → GitHub Actions** (wording may evolve; verify current GitHub interface if needed).
- Confirm that the built output contains all assets and internal links resolve under a repository subpath.
- Do not commit generated build output unless the deployment strategy requires it.

## 10. Acceptance criteria

The goal is complete only when all of the following are true:

1. The site runs locally from documented commands.
2. The page has a distinctive, polished, responsive visual design.
3. The PCIe generation control and lane-width control update all computed metrics correctly and immediately.
4. A second PCIe configuration can be selected and compared.
5. The lane diagram updates to match the selected width.
6. USB, HDMI, Ethernet, and Wi-Fi comparisons are present, filterable, source-linked, and clearly annotated by measurement type and directionality.
7. The comparison visualization remains meaningful across orders of magnitude and has a table/text alternative.
8. Worked examples and file-transfer estimates are interactive or derive from the same tested calculation functions.
9. The glossary explains the key terms in plain English.
10. All technical values have authoritative sources and the methodology explains how values are calculated.
11. Critical caveats are visible at the point where the relevant number is shown.
12. The site works on mobile, supports keyboard navigation, and respects reduced-motion preferences.
13. Automated tests cover the calculation logic and pass.
14. Lint, type-check, tests, and production build all pass.
15. GitHub Pages deployment workflow and repository base-path handling are implemented and documented.
16. The README explains the project, local use, verification commands, data sources, and Pages setup.
17. No fake benchmarks, misleading equivalence claims, broken links, placeholder content, or dead controls remain.

## 11. Authoritative source set

Use these as the initial source set. Re-check the pages before finalizing because standards and published revisions can change. Add a source only when it supports a specific displayed claim.

### PCI Express

- PCI-SIG — PCI Express 7.0 FAQ / rate and bidirectional bandwidth: https://pcisig.com/what-data-rate-pcie-70-specification
- PCI-SIG — PCI Express 7.0 key features: https://pcisig.com/what-are-key-features-pcie-70-specification
- PCI-SIG — PCI Express 6.0 specification and 64 GT/s / 256 GB/s x16 headline: https://pcisig.com/pci-express-6.0-specification
- PCI-SIG — PCIe 6.0 PAM4, FLIT, FEC/CRC FAQ: https://pcisig.com/faq?field_category_value%5B%5D=pci_express_6.0&keys=PAM4
- PCI-SIG — approved base specification revisions (check current revision status): https://pcisig.com/specification-overview/pci-express-base
- PCI-SIG — PCIe 5.0 compliance/cabling webinar table with generations, GT/s, encoding and signaling: https://pcisig.com/sites/default/files/files/PCI-SIG%20Cabling%20Webinar_FINAL.pdf

### USB

- USB-IF — USB 3.2 rates (5, 10 and 20 Gbps): https://www.usb.org/usb-32-0
- USB-IF — USB4 overview and dynamic protocol sharing: https://usb.org/usb4
- USB-IF — USB 80Gbps / asymmetric 120Gbps + 40Gbps announcement: https://www.usb.org/sites/default/files/2022-10/USB-IF%20USB%2080Gbps%20Announcement_FINAL_v2.pdf
- USB-IF — USB4 Specification v2.0 document page: https://www.usb.org/document-library/usb4r-specification-v20
- USB-IF — USB 2.0 specification library entry: https://www.usb.org/document-library/usb-20-specification

### HDMI

- HDMI Forum — HDMI 2.2 specification announcement (96 Gbps): https://hdmiforum.org/hdmi-forum-releases-version-2-2-of-the-hdmi-specification/
- HDMI Licensing Administrator — specification bandwidth comparison (10.2 / 18 / 48 / 96 Gbps): https://hdmi.org/download/savefile?fileKey=Marketing%2FHDMI-LA-CES-New-Spec-Press-Conference-20250106_All_Languages.pdf

### Ethernet

- IEEE — 802.3df-2024, 400 Gb/s and 800 Gb/s operation: https://standards.ieee.org/ieee/802.3df/11107/
- Ethernet Alliance — 2026 Ethernet Roadmap (use roadmap items only when visibly marked as emerging/future): https://ethernetalliance.org/technology/ethernet-roadmap/
- IEEE — IEEE 802.3-2022 standard overview: https://standards.ieee.org/ieee/802.3/12400/

### Wi-Fi

- IEEE — IEEE 802.11be-2024 (Wi-Fi 7) standard; at least one mode supporting 30 Gbit/s MAC throughput: https://standards.ieee.org/ieee/802.11ax/7516/
- Wi-Fi Alliance — Wi-Fi CERTIFIED 7 Technology Overview: https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7
- Intel — Wi-Fi 7 client product examples and supported 2x2 rates: https://www.intel.com/content/www/us/en/products/details/wireless/wi-fi-7-series.html
- Manufacturer technical white papers may be used for a calculated maximum PHY ceiling (for example 16 spatial streams, 320 MHz, 4096-QAM), but label it as a theoretical multi-stream maximum and do not present it as a typical client rate.

## 12. Final report

At completion, provide a concise implementation report containing:

- What was built and the key user-facing features.
- The chosen stack and why it fits a static GitHub Pages site.
- The main files created/changed.
- The standards/data-source approach and any values intentionally omitted due to uncertainty.
- Commands executed and exact results for lint, type-check, tests, and production build.
- GitHub Pages setup steps still requiring the repository owner's action, if any.
- Any remaining limitations, stated plainly.

Do not mark the goal complete while acceptance criteria remain unmet. If a criterion cannot be met, explain why and provide the strongest working alternative without inventing success.
