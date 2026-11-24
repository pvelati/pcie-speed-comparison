/**
 * Interactive PCIe explorer: two independently configurable links with
 * immediate, dependency-free DOM updates (no framework, no async staleness).
 */
import { LANE_WIDTHS, PCIE_GENERATIONS, UNCOMMON_LANES } from '../data/standards.js';
import type { PcieGeneration } from '../data/standards.js';
import { linkMetrics, oneWayRatio } from '../lib/pcie.js';
import { formatRate, withUnit } from '../lib/format.js';
import { el } from '../dom.js';

interface PanelRefs {
  oneWayGBps: HTMLElement;
  oneWayGbps: HTMLElement;
  bidirGBps: HTMLElement;
  bidirGbps: HTMLElement;
  genLabel: HTMLElement;
  rawRate: HTMLElement;
  encoding: HTMLElement;
  laneCount: HTMLElement;
  perLane: HTMLElement;
  note: HTMLElement;
  metricsRoot: HTMLElement;
}

export function buildExplorer(onLinkAChange: (lanes: number) => void): HTMLElement {
  const section = el(
    'section',
    { id: 'explorer', class: 'section explorer' },
    el(
      'div',
      { class: 'section-head' },
      el('p', { class: 'eyebrow' }, '01 · Interactive explorer'),
      el('h2', {}, 'PCIe bandwidth, generation by generation'),
      el(
        'p',
        { class: 'lede' },
        'Pick a generation and lane count for each link. Every figure updates instantly. ',
        el('strong', {}, 'All values are theoretical link-level ceilings'),
        ': specification maximums, not guaranteed application throughput.',
      ),
    ),
  );

  interface PanelState {
    gen: PcieGeneration;
    lanes: number;
  }
  const stateA: PanelState = { gen: PCIE_GENERATIONS[3], lanes: 16 }; // PCIe 4.0 ×16
  const stateB: PanelState = { gen: PCIE_GENERATIONS[2], lanes: 4 }; // PCIe 3.0 ×4

  let overhead = 0; // percent of spec ceiling lost to protocol overhead
  const refreshFns: Array<() => void> = [];

  const buildPanel = (id: 'a' | 'b', state: PanelState, onExternalChange?: () => void) => {
    const refs: PanelRefs = {} as PanelRefs;

    const genRadios = PCIE_GENERATIONS.map((g) => ({
      value: String(g.generation),
      label: g.status === 'future' ? `${g.label} (future)` : g.label,
    }));
    const laneRadios = LANE_WIDTHS.map((w) => ({
      value: String(w),
      label: UNCOMMON_LANES.has(w) ? `×${w} †` : `×${w}`,
    }));

    const genGroup = radioGroup(
      `gen-${id}`,
      'PCIe generation',
      genRadios,
      String(state.gen.generation),
      (value) => {
        state.gen = PCIE_GENERATIONS.find((g) => g.generation === Number(value))!;
        refresh();
      },
    );
    const laneGroup = radioGroup(
      `lanes-${id}`,
      'Link width (lanes)',
      laneRadios,
      String(state.lanes),
      (value) => {
        state.lanes = Number(value);
        refresh();
      },
    );

    // -- results -------------------------------------------------------------
    const oneWayGBps = el('span', { class: 'num' }, formatRate(0));
    const oneWayGbps = el('span', { class: 'num' }, 'n/a');
    const bidirGBps = el('span', { class: 'num' }, 'n/a');
    const bidirGbps = el('span', { class: 'num' }, 'n/a');
    const genLabel = el('dd', {}, 'n/a');
    const rawRate = el('dd', {}, 'n/a');
    const encoding = el('dd', {}, 'n/a');
    const laneCount = el('dd', {}, 'n/a');
    const perLane = el('dd', {}, 'n/a');
    const note = el('p', { class: 'fineprint' }, '');
    const noteDetails = el(
      'details',
      { class: 'note-details hideable hideable-bare', open: true },
      el('summary', {}, 'How this number is calculated'),
      note,
    );
    const metricsRoot = el('div', { class: 'panel-metrics', 'aria-live': 'polite' });

    Object.assign(refs, {
      oneWayGBps,
      oneWayGbps,
      bidirGBps,
      bidirGbps,
      genLabel,
      rawRate,
      encoding,
      laneCount,
      perLane,
      note,
      metricsRoot,
    });

    const panel = el(
      'article',
      { class: 'link-panel', 'data-link': id },
      el(
        'header',
        { class: 'link-panel-head' },
        el(
          'h3',
          {},
          el('span', { class: 'link-badge' }, id.toUpperCase()),
          ` Link ${id.toUpperCase()}`,
        ),
      ),
      genGroup,
      laneGroup,
      metricsRoot,
      el(
        'dl',
        { class: 'spec-grid' },
        el('div', {}, el('dt', {}, 'Generation'), genLabel),
        el('div', {}, el('dt', {}, 'Raw rate'), rawRate),
        el('div', {}, el('dt', {}, 'Encoding / signaling'), encoding),
        el('div', {}, el('dt', {}, 'Lanes'), laneCount),
        el('div', {}, el('dt', {}, 'Per lane, one-way'), perLane),
      ),
      noteDetails,
    );

    function refresh() {
      const m = linkMetrics(state.gen, state.lanes);
      refs.oneWayGBps.textContent = formatRate(m.oneWayGBps);
      refs.oneWayGbps.textContent = withUnit(m.oneWayGbps, 'Gbps');
      refs.bidirGBps.textContent = withUnit(m.bidirectionalGBps, 'GB/s');
      refs.bidirGbps.textContent = withUnit(m.bidirectionalGbps, 'Gbps');
      refs.genLabel.textContent =
        state.gen.status === 'future' ? `${state.gen.label} (future)` : state.gen.label;
      refs.rawRate.textContent = withUnit(state.gen.rawRateGTs, 'GT/s');
      refs.encoding.textContent = state.gen.encoding;
      refs.laneCount.textContent = `×${state.lanes}`;
      refs.perLane.textContent = withUnit(m.perLaneGBps, 'GB/s');
      refs.note.textContent =
        `Note: ${state.gen.calculationNote} Lane scaling: one-way = per-lane × ${state.lanes}. ` +
        'The formula accounts for line encoding only. Packet/protocol overhead and higher layers make real application payload lower.';

      const eff = (v: number) => (overhead === 0 ? v : v * (1 - overhead / 100));
      refs.metricsRoot.replaceChildren(
        el(
          'div',
          { class: 'metric-hero' },
          el(
            'span',
            { class: 'metric-label' },
            overhead === 0 ? 'One-way link ceiling' : `One-way, after ${overhead}% overhead`,
          ),
          el(
            'span',
            { class: 'metric-value' },
            el('span', { class: 'num' }, formatRate(eff(m.oneWayGBps))),
            el('small', {}, 'GB/s'),
          ),
          el(
            'span',
            { class: 'metric-sub' },
            overhead === 0
              ? `${withUnit(m.oneWayGbps, 'Gbps')} · per direction`
              : `spec ceiling ${withUnit(m.oneWayGBps, 'GB/s')} minus ${overhead}% · per direction`,
          ),
        ),
        el(
          'div',
          { class: 'metric-bidir' },
          el('span', { class: 'metric-label' }, 'Bidirectional aggregate (both directions summed)'),
          el(
            'span',
            { class: 'metric-value small' },
            el('span', { class: 'num' }, formatRate(eff(m.bidirectionalGBps))),
            el('small', {}, 'GB/s'),
          ),
          el(
            'span',
            { class: 'metric-sub' },
            overhead === 0
              ? `${withUnit(m.bidirectionalGbps, 'Gbps')} total`
              : `spec ${withUnit(m.bidirectionalGBps, 'GB/s')} minus ${overhead}%`,
          ),
        ),
      );

      onExternalChange?.();
    }

    refreshFns.push(refresh);
    refresh();
    return panel;
  };

  // -- comparison strip (built first: each panel's initial refresh updates it) --
  const ratioValue = el('span', { class: 'ratio' }, 'n/a');
  const stripA = el('span', { class: 'strip-val' }, '');
  const stripB = el('span', { class: 'strip-val' }, '');
  const compareStrip = el(
    'div',
    { class: 'compare-strip', 'aria-live': 'polite' },
    el(
      'p',
      { class: 'compare-strip-title' },
      el('strong', {}, 'Link A vs Link B'),
      el('span', {}, ': one-way link ceiling'),
    ),
    el(
      'p',
      { class: 'compare-strip-vals' },
      el('span', { class: 'strip-chip' }, 'A ', stripA),
      el('span', { class: 'strip-chip' }, 'B ', stripB),
      ratioValue,
    ),
    el(
      'p',
      { class: 'fineprint' },
      'Basis: one-way (per-direction) theoretical link ceiling for both links. The bidirectional totals are not mixed into this ratio.',
    ),
  );

  const panelA = buildPanel('a', stateA, () => {
    onLinkAChange(stateA.lanes);
    refreshCompare();
  });
  const panelB = buildPanel('b', stateB, () => refreshCompare());

  const swapBtn = el('button', { class: 'btn swap-btn', type: 'button' }, 'Swap A ↔ B');
  swapBtn.addEventListener('click', () => {
    const tmpGen = stateA.gen;
    const tmpLanes = stateA.lanes;
    stateA.gen = stateB.gen;
    stateA.lanes = stateB.lanes;
    stateB.gen = tmpGen;
    stateB.lanes = tmpLanes;
    const apply = (
      panel: HTMLElement,
      prefix: string,
      state: { gen: PcieGeneration; lanes: number },
    ) => {
      panel
        .querySelector<HTMLInputElement>(
          `input[name="gen-${prefix}"][value="${state.gen.generation}"]`,
        )
        ?.click();
      panel
        .querySelector<HTMLInputElement>(`input[name="lanes-${prefix}"][value="${state.lanes}"]`)
        ?.click();
    };
    apply(panelA, 'a', stateA);
    apply(panelB, 'b', stateB);
  });
  compareStrip.append(el('p', { class: 'strip-actions' }, swapBtn));

  // -- protocol overhead -----------------------------------------------------------
  const overheadRange = el('input', {
    class: 'overhead-range',
    type: 'range',
    id: 'overhead-range',
    min: '0',
    max: '40',
    step: '5',
    value: '0',
  });
  const overheadOut = el('output', { for: 'overhead-range' }, '0%');
  const overheadControl = el(
    'div',
    { class: 'overhead-control' },
    el('label', { for: 'overhead-range', class: 'overhead-label' }, 'Protocol overhead'),
    overheadRange,
    overheadOut,
    el(
      'p',
      { class: 'overhead-note' },
      'How much sustained payload typically falls short of the spec ceiling: ',
      'PCIe TLP/DLLP ~5–10% on large transfers (much more on small packets); Ethernet framing 39 B per frame (up to ~35% at 64 B frames, under 1% at 1500 B); USB handshakes ~5–20%; Wi-Fi MAC, ACKs and retransmissions ~20–40%. ',
      'Rules of thumb from the protocol specifications, not a single standard number. The assumption is identical for both links, so it cancels in the A/B ratio.',
    ),
  );
  overheadRange.addEventListener('input', () => {
    overhead = Number(overheadRange.value);
    overheadOut.textContent = `${overhead}%`;
    for (const f of refreshFns) f();
  });

  function refreshCompare() {
    const a = linkMetrics(stateA.gen, stateA.lanes);
    const b = linkMetrics(stateB.gen, stateB.lanes);
    stripA.textContent = withUnit(a.oneWayGBps, 'GB/s');
    stripB.textContent = withUnit(b.oneWayGBps, 'GB/s');
    const r = oneWayRatio(a, b);
    if (Math.abs(r - 1) < 1e-9) {
      ratioValue.textContent = 'identical one-way ceilings';
    } else if (r > 1) {
      ratioValue.textContent = `A is ${formatRate(r)}× B`;
    } else {
      ratioValue.textContent = `B is ${formatRate(1 / r)}× A`;
    }
  }

  section.append(
    el('div', { class: 'explorer-grid' }, panelA, panelB, compareStrip),
    overheadControl,
    el(
      'p',
      { class: 'footnote' },
      el('sup', {}, '†'),
      ' ×32 is supported by the PCIe specification but uncommon outside specific server/high-end configurations; it is not a typical desktop slot width.',
    ),
  );

  return section;
}

function radioGroup(
  name: string,
  legend: string,
  options: Array<{ value: string; label: string }>,
  selected: string,
  onChange: (value: string) => void,
): HTMLFieldSetElement {
  const fieldset = el('fieldset', { class: 'seg-fieldset' });
  fieldset.append(el('legend', {}, legend));
  const box = el('div', { class: 'seg-group', role: 'group', 'aria-label': legend });
  for (const opt of options) {
    const inputId = `${name}-${opt.value}`;
    const input = el('input', {
      type: 'radio',
      name,
      value: opt.value,
      id: inputId,
      checked: opt.value === selected,
    });
    input.addEventListener('change', () => {
      if (input.checked) onChange(opt.value);
    });
    box.append(
      el(
        'label',
        { class: 'seg', for: inputId },
        input,
        el('span', { class: 'seg-text' }, opt.label),
      ),
    );
  }
  fieldset.append(box);
  return fieldset;
}
