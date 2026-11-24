/**
 * Worked examples. All figures derive from the same tested calculation
 * functions as the explorer (src/lib/pcie.ts).
 */
import { INTERFACE_RATES, PCIE_GENERATIONS } from '../data/standards.js';
import { DECIMAL_GIGABYTES, formatDuration, linkMetrics, transferSeconds } from '../lib/pcie.js';
import { formatRate, withUnit } from '../lib/format.js';
import { el } from '../dom.js';

const gen = (n: number) => PCIE_GENERATIONS.find((g) => g.generation === n)!;
const rate = (id: string) => INTERFACE_RATES.find((r) => r.id === id)!;

export function buildExamples(): HTMLElement {
  const section = el(
    'section',
    { id: 'examples', class: 'section examples' },
    el(
      'div',
      { class: 'section-head' },
      el('p', { class: 'eyebrow' }, '04 · Practical examples'),
      el('h2', {}, 'What these numbers buy you'),
      el(
        'p',
        { class: 'lede' },
        'Concrete configurations, computed from the same model as the explorer. These are ',
        el('strong', {}, 'theoretical ceilings'),
        'Real transfers are slower.',
      ),
    ),
  );

  // -- Example 1: NVMe Gen 4 ×4 ------------------------------------------------
  const nvme = linkMetrics(gen(4), 4);
  const ex1 = el(
    'article',
    { class: 'example-card' },
    el('h3', {}, '1 · An NVMe-class SSD (PCIe Gen 4 ×4)'),
    el(
      'p',
      { class: 'example-big' },
      withUnit(nvme.oneWayGBps, 'GB/s'),
      el('small', {}, ` ≈ ${withUnit(nvme.oneWayGbps, 'Gbps')}, one direction`),
    ),
    el(
      'p',
      {},
      'Gen 4 ×4 is the common high-end NVMe connection. The 16 GT/s lanes deliver roughly ',
      el('strong', {}, `${formatRate(nvme.oneWayGBps)} GB/s per direction at the link level`),
      " before packet and protocol overhead. Sustained copy speeds you will see in a file manager are set by the drive's controller, its DRAM cache and the protocol stack, not by this ceiling alone.",
    ),
  );

  // -- Example 2: GPU Gen 4 ×16 / Gen 5 ×16 ------------------------------------
  const gpu4 = linkMetrics(gen(4), 16);
  const gpu5 = linkMetrics(gen(5), 16);
  const ex2 = el(
    'article',
    { class: 'example-card' },
    el('h3', {}, '2 · A discrete GPU (×16 slot)'),
    el(
      'p',
      { class: 'example-big' },
      el('span', {}, withUnit(gpu4.oneWayGBps, 'GB/s')),
      el('span', { class: 'example-vs' }, 'Gen 4 ×16 → '),
      el('span', {}, withUnit(gpu5.oneWayGBps, 'GB/s')),
      el('span', { class: 'example-vs' }, 'Gen 5 ×16'),
    ),
    el(
      'p',
      {},
      'GPU frames, textures and model weights cross the same link in both directions. Going from Gen 4 to Gen 5 ',
      el(
        'strong',
        {},
        `doubles the per-direction ceiling (${formatRate(gpu5.oneWayGBps / gpu4.oneWayGBps)}×)`,
      ),
      'Useful when feeding large models or 4K+ framebuffers. A physical ×16 slot may be wired for fewer lanes, and the negotiated rate depends on both ends.',
    ),
  );

  // -- Example 3: scale check vs external interfaces ----------------------------
  const scaleItems: Array<{ name: string; oneWayGBps: number; note?: string }> = [
    { name: 'PCIe Gen 3 ×4', oneWayGBps: linkMetrics(gen(3), 4).oneWayGBps },
    { name: 'PCIe Gen 4 ×4', oneWayGBps: nvme.oneWayGBps },
    { name: 'USB 3.2 Gen 2 (10 Gbps)', oneWayGBps: rate('usb32g2').rateGbps / 8 },
    { name: 'USB 3.2 Gen 2×2 (20 Gbps)', oneWayGBps: rate('usb32g2x2').rateGbps / 8 },
    { name: '10GbE', oneWayGBps: rate('eth10g').rateGbps / 8 },
    { name: 'USB4 (40 Gbps)', oneWayGBps: rate('usb4-40').rateGbps / 8 },
  ];
  const base = nvme.oneWayGBps;
  const ex3 = el(
    'article',
    { class: 'example-card' },
    el('h3', {}, '3 · Scale check against familiar interfaces'),
    el(
      'table',
      { class: 'mini-table' },
      el(
        'caption',
        { class: 'visually-hidden' },
        'One-way specification ceilings compared against PCIe Gen 4 ×4 as the reference.',
      ),
      el(
        'thead',
        {},
        el(
          'tr',
          {},
          el('th', { scope: 'col' }, 'Interface'),
          el('th', { scope: 'col' }, 'One-way ceiling'),
          el('th', { scope: 'col' }, 'vs Gen 4 ×4'),
        ),
      ),
      el(
        'tbody',
        {},
        ...scaleItems.map((item) =>
          el(
            'tr',
            {},
            el('td', {}, item.name),
            el('td', { class: 'td-rate' }, withUnit(item.oneWayGBps, 'GB/s')),
            el('td', {}, `×${formatRate(item.oneWayGBps / base)}`),
          ),
        ),
      ),
    ),
    el(
      'p',
      { class: 'fineprint' },
      'Basis: one-way, per-direction specification ceiling (Ethernet/USB figures are their per-direction rates; Wi-Fi and HDMI are excluded here because their numbers measure different things: a shared-medium PHY rate and a display-path bandwidth, respectively).',
    ),
  );

  // -- Example 4: interactive transfer calculator --------------------------------
  const configs = [
    { id: 'gen3x4', label: 'Gen 3 ×4', metrics: linkMetrics(gen(3), 4) },
    { id: 'gen4x4', label: 'Gen 4 ×4', metrics: linkMetrics(gen(4), 4) },
    { id: 'gen5x16', label: 'Gen 5 ×16', metrics: linkMetrics(gen(5), 16) },
    { id: 'gen6x16', label: 'Gen 6 ×16', metrics: linkMetrics(gen(6), 16) },
  ];
  const sizes = Object.entries(DECIMAL_GIGABYTES);

  const timeOut = el('span', { class: 'num', id: 'transfer-time' }, 'n/a');
  const timeSub = el('span', { class: 'metric-sub' }, '');
  const calcOut = el(
    'div',
    { class: 'calc-out', 'aria-live': 'polite' },
    el('span', { class: 'metric-label' }, 'Idealized minimum transfer time'),
    el('span', { class: 'calc-value' }, timeOut),
    timeSub,
  );

  let activeConfig = 'gen4x4';
  let activeSize = '10 GB';

  function refreshCalc() {
    const c = configs.find((x) => x.id === activeConfig)!;
    const bytes = DECIMAL_GIGABYTES[activeSize];
    const secs = transferSeconds(bytes, c.metrics.oneWayGBps);
    timeOut.textContent = formatDuration(secs);
    timeSub.textContent = `${activeSize} (decimal, 1 GB = 1,000 MB) ÷ ${withUnit(c.metrics.oneWayGBps, 'GB/s')}, one direction. time = bytes ÷ bytes per second.`;
  }

  const pillGroup = (
    name: string,
    options: Array<{ value: string; label: string }>,
    initial: string,
    onSelect: (v: string) => void,
  ) => {
    const box = el('div', { class: 'pill-group', role: 'group', 'aria-label': name });
    for (const opt of options) {
      const id = `${name}-${opt.value}`.replace(/\s+/g, '-').toLowerCase();
      const input = el('input', {
        type: 'radio',
        name,
        value: opt.value,
        id,
        checked: opt.value === initial,
      });
      input.addEventListener('change', () => {
        if (input.checked) onSelect(opt.value);
      });
      box.append(el('label', { class: 'pill', for: id }, input, el('span', {}, opt.label)));
    }
    return box;
  };

  const ex4 = el(
    'article',
    { class: 'example-card calc-card' },
    el('h3', {}, '4 · How long to move a big file?'),
    pillGroup(
      'transfer-config',
      configs.map((c) => ({ value: c.id, label: `PCIe ${c.label}` })),
      activeConfig,
      (v) => {
        activeConfig = v;
        refreshCalc();
      },
    ),
    pillGroup(
      'transfer-size',
      sizes.map(([label]) => ({ value: label, label })),
      activeSize,
      (v) => {
        activeSize = v;
        refreshCalc();
      },
    ),
    calcOut,
    el(
      'details',
      { class: 'caveat-box hideable', open: true },
      el('summary', {}, el('strong', {}, 'This is an idealized lower bound, not a benchmark.')),
      el(
        'p',
        { class: 'caveat-body' },
        'It assumes the theoretical link rate is available end-to-end. In reality, protocol overhead, the own speed of the storage device, controller limits, CPU/DRAM bandwidth, thermal throttling and the source/destination side all reduce what you actually measure.',
      ),
    ),
  );
  refreshCalc();

  section.append(el('div', { class: 'examples-grid' }, ex1, ex2, ex3, ex4));
  return section;
}
