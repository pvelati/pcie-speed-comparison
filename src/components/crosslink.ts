/** Cross-standard comparison: any two rows from ALL_ROWS, per-side clickable
 * overhead presets (family defaults apply on selection), unit switcher. */
import { el } from '../dom.js';
import { ALL_ROWS, STATUS_LABEL, type ChartRow } from './compare.js';
import { formatRate } from '../lib/format.js';
import { familyIcon } from './icons.js';

const DEFAULT_OVERHEAD: Record<string, number> = {
  PCIe: 10,
  USB: 15,
  HDMI: 0,
  Ethernet: 10,
  'Wi-Fi': 30,
  Memory: 0,
};

const PRESETS = [0, 10, 15, 30, 35];

const UNITS = [
  { id: 'gbps', label: 'GB/s', factor: (g: number) => g / 8 },
  { id: 'gbit', label: 'Gbps', factor: (g: number) => g },
  { id: 'mbps', label: 'MB/s', factor: (g: number) => (g / 8) * 1000 },
  { id: 'tbps', label: 'TB/s', factor: (g: number) => g / 8 / 1000 },
] as const;

type Unit = (typeof UNITS)[number];

function byId(id: string): ChartRow {
  const row = ALL_ROWS.find((r) => r.id === id);
  if (!row) throw new Error(`unknown row id: ${id}`);
  return row;
}

interface SideState {
  row: ChartRow;
  overhead: number;
}

export function buildCrossLink(): HTMLElement {
  let unit: Unit = UNITS[0];
  const state: Record<'a' | 'b', SideState> = {
    a: { row: byId('ddr5'), overhead: DEFAULT_OVERHEAD.Memory },
    b: { row: byId('pcie-4'), overhead: DEFAULT_OVERHEAD.PCIe },
  };

  const buildSide = (id: 'a' | 'b') => {
    const select = el('select', { class: 'cross-select', id: `cross-${id}` });
    const families = [...new Set(ALL_ROWS.map((r) => r.family))];
    for (const family of families) {
      const og = el('optgroup', { label: family });
      for (const r of ALL_ROWS.filter((x) => x.family === family)) {
        og.append(
          el('option', { value: r.id }, r.status === 'future' ? `${r.label} (future)` : r.label),
        );
      }
      select.append(og);
    }
    select.value = state[id].row.id;

    const range = el('input', {
      class: 'cross-range',
      type: 'range',
      min: '0',
      max: '40',
      step: '1',
      value: String(state[id].overhead),
      'aria-label': `Protocol overhead for side ${id.toUpperCase()} (%)`,
    });
    const pct = el('output', { class: 'cross-pct', for: `cross-${id}` }, `${state[id].overhead}%`);
    const presetBtns = PRESETS.map((v) =>
      el('button', { class: 'preset-btn', type: 'button', 'data-value': String(v) }, `${v}%`),
    );
    const presetsBox = el(
      'div',
      {
        class: 'cross-presets',
        role: 'group',
        'aria-label': `Overhead presets for ${id.toUpperCase()}`,
      },
      ...presetBtns,
    );

    const num = el('span', { class: 'num' }, '');
    const unitEl = el('small', {}, '');
    const sub = el('p', { class: 'cross-sub' }, '');

    const applyOverhead = (v: number) => {
      state[id].overhead = v;
      range.value = String(v);
      pct.textContent = `${v}%`;
      for (const b of presetBtns) {
        b.classList.toggle('active', Number(b.getAttribute('data-value')) === v);
      }
      refresh();
    };
    for (const b of presetBtns) {
      b.addEventListener('click', () => applyOverhead(Number(b.getAttribute('data-value'))));
    }
    range.addEventListener('input', () => applyOverhead(Number(range.value)));
    select.addEventListener('change', () => {
      state[id].row = byId(select.value);
      applyOverhead(DEFAULT_OVERHEAD[state[id].row.family] ?? 0);
    });

    const side = el(
      'div',
      { class: 'cross-side' },
      el('label', { for: `cross-${id}`, class: 'cross-label' }, `${id.toUpperCase()} · standard`),
      select,
      el('div', { class: 'cross-overhead' }, range, pct),
      presetsBox,
      el('div', { class: 'cross-value', 'aria-live': 'polite' }, num, unitEl),
      sub,
    );
    return { side, num, unitEl, sub, applyOverhead };
  };

  const a = buildSide('a');
  const b = buildSide('b');
  const ratio = el('p', { class: 'cross-ratio', 'aria-live': 'polite' }, '');

  const unitGroup = el('div', { class: 'pill-group', role: 'group', 'aria-label': 'Display unit' });
  for (const u of UNITS) {
    const input = el('input', {
      type: 'radio',
      name: 'cross-unit',
      value: u.id,
      id: `cross-unit-${u.id}`,
      checked: u.id === unit.id,
    });
    input.addEventListener('change', () => {
      if (input.checked) {
        unit = u;
        refresh();
      }
    });
    unitGroup.append(
      el('label', { class: 'pill', for: `cross-unit-${u.id}` }, input, el('span', {}, u.label)),
    );
  }

  function refresh() {
    for (const [side, s] of [
      [a, state.a],
      [b, state.b],
    ] as const) {
      const eff = s.row.rateGbps * (1 - s.overhead / 100);
      side.num.textContent = formatRate(unit.factor(eff));
      side.unitEl.textContent = unit.label;
      side.sub.textContent = `${s.row.label}: ${s.row.displayRate} spec value · ${STATUS_LABEL[s.row.status]} · ${s.overhead}% overhead applied`;
    }
    const ea = state.a.row.rateGbps * (1 - state.a.overhead / 100);
    const eb = state.b.row.rateGbps * (1 - state.b.overhead / 100);
    const r = ea / eb;
    if (Math.abs(r - 1) < 0.005) {
      ratio.textContent = 'nearly identical';
    } else if (r > 1) {
      ratio.textContent = `A is ${formatRate(r)}× B`;
    } else {
      ratio.textContent = `B is ${formatRate(1 / r)}× A`;
    }
  }

  refresh();

  return el(
    'div',
    { class: 'crosslink' },
    el('h3', {}, familyIcon('pcie', 18), 'Compare any two standards'),
    el(
      'p',
      { class: 'cross-note' },
      "Pick a standard for each side. Overhead starts at the family's typical default on selection; adjust it with the slider (0-40%, 1% steps) or the preset buttons. ",
      'PCIe rows are ×16 one-way link ceilings; RAM rows are per-channel bandwidth; the other families are headline spec rates. The ratio uses the overhead-adjusted values.',
    ),
    el(
      'div',
      { class: 'cross-grid' },
      a.side,
      el('div', { class: 'cross-center' }, ratio, unitGroup),
      b.side,
    ),
  );
}
