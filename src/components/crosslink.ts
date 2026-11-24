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
  channels: number;
}

export interface CrossLinkState {
  a: string;
  ohA: number;
  chA: number;
  b: string;
  ohB: number;
  chB: number;
  unit: string;
}

export interface CrossLinkHandle {
  root: HTMLElement;
  get: () => CrossLinkState;
  set: (s: Partial<CrossLinkState>) => void;
}

const CHANNEL_COUNTS = [1, 2, 4, 8];

export function buildCrossLink(onStateChange?: () => void): CrossLinkHandle {
  let unit: Unit = UNITS[0];
  const state: Record<'a' | 'b', SideState> = {
    a: { row: byId('ddr5'), overhead: DEFAULT_OVERHEAD.Memory, channels: 1 },
    b: { row: byId('pcie-4'), overhead: DEFAULT_OVERHEAD.PCIe, channels: 1 },
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
    const channelBox = el('div', {
      class: 'cross-channels',
      role: 'group',
      'aria-label': `Memory channel count for side ${id.toUpperCase()}`,
    });
    for (const n of CHANNEL_COUNTS) {
      const input = el('input', {
        type: 'radio',
        name: `cross-ch-${id}`,
        value: String(n),
        id: `cross-ch-${id}-${n}`,
        checked: n === 1,
      });
      input.addEventListener('change', () => {
        if (input.checked) {
          state[id].channels = n;
          refresh();
        }
      });
      channelBox.append(
        el('label', { class: 'pill', for: `cross-ch-${id}-${n}` }, input, el('span', {}, `x${n}`)),
      );
    }
    const syncChannels = () => {
      const isMemory = state[id].row.family === 'Memory';
      channelBox.hidden = !isMemory;
      if (!isMemory) {
        state[id].channels = 1;
        channelBox.querySelector<HTMLInputElement>('input[value="1"]')?.click();
      }
      channelBox.setAttribute(
        'aria-label',
        `Memory ${state[id].row.id.startsWith('hbm') ? 'stack' : 'channel'} count for side ${id.toUpperCase()}`,
      );
    };
    syncChannels();
    select.addEventListener('change', () => {
      state[id].row = byId(select.value);
      applyOverhead(DEFAULT_OVERHEAD[state[id].row.family] ?? 0);
      syncChannels();
    });

    const side = el(
      'div',
      { class: 'cross-side' },
      el('label', { for: `cross-${id}`, class: 'cross-label' }, `${id.toUpperCase()} · standard`),
      select,
      channelBox,
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
      const mult = s.row.family === 'Memory' ? s.channels : 1;
      const eff = s.row.rateGbps * (1 - s.overhead / 100) * mult;
      side.num.textContent = formatRate(unit.factor(eff));
      side.unitEl.textContent = unit.label;
      const word = s.row.id.startsWith('hbm') ? 'stacks' : 'channels';
      const multPart =
        s.row.family === 'Memory' && s.channels > 1 ? ` · x${s.channels} ${word}` : '';
      side.sub.textContent = `${s.row.label}: ${s.row.displayRate} spec value · ${STATUS_LABEL[s.row.status]}${multPart} · ${s.overhead}% overhead applied`;
    }
    const ea =
      state.a.row.rateGbps *
      (1 - state.a.overhead / 100) *
      (state.a.row.family === 'Memory' ? state.a.channels : 1);
    const eb =
      state.b.row.rateGbps *
      (1 - state.b.overhead / 100) *
      (state.b.row.family === 'Memory' ? state.b.channels : 1);
    const r = ea / eb;
    if (Math.abs(r - 1) < 0.005) {
      ratio.textContent = 'nearly identical';
    } else if (r > 1) {
      ratio.textContent = `A is ${formatRate(r)}× B`;
    } else {
      ratio.textContent = `B is ${formatRate(1 / r)}× A`;
    }
    onStateChange?.();
  }

  refresh();

  const handle: CrossLinkHandle = {
    root: el(
      'div',
      { class: 'crosslink' },
      el('h3', {}, familyIcon('pcie', 18), 'Compare any two standards'),
      el(
        'p',
        { class: 'cross-note' },
        "Pick a standard for each side. Overhead starts at the family's typical default on selection; adjust it with the slider (0-40%, 1% steps) or the preset buttons. ",
        'PCIe rows are ×16 one-way link ceilings. RAM rows are per-channel bandwidth for DDR and per-stack bandwidth for HBM; the ×N buttons multiply by channel (DDR) or stack (HBM) count. Other families are headline spec rates. The ratio uses the adjusted values.',
      ),
      el(
        'div',
        { class: 'cross-grid' },
        a.side,
        el('div', { class: 'cross-center' }, ratio, unitGroup),
        b.side,
      ),
    ),
    get: () => ({
      a: state.a.row.id,
      ohA: state.a.overhead,
      chA: state.a.channels,
      b: state.b.row.id,
      ohB: state.b.overhead,
      chB: state.b.channels,
      unit: unit.id,
    }),
    set: (s) => {
      const applySide = (id: 'a' | 'b', rowId?: string, oh?: number, ch?: number) => {
        const side = id === 'a' ? a : b;
        const sel = side.side.querySelector('select');
        if (rowId && sel) {
          const exists = [...sel.options].some((o) => o.value === rowId);
          if (exists && sel.value !== rowId) {
            sel.value = rowId;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        if (oh !== undefined) side.applyOverhead(oh);
        if (ch !== undefined) {
          const input = side.side.querySelector<HTMLInputElement>(
            `input[name="cross-ch-${id}"][value="${ch}"]`,
          );
          if (input && !input.checked) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      };
      if (s.a !== undefined || s.ohA !== undefined || s.chA !== undefined)
        applySide('a', s.a, s.ohA, s.chA);
      if (s.b !== undefined || s.ohB !== undefined || s.chB !== undefined)
        applySide('b', s.b, s.ohB, s.chB);
      if (s.unit !== undefined) {
        const input = document.querySelector<HTMLInputElement>(`#cross-unit-${s.unit}`);
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    },
  };
  return handle;
}
