/**
 * Lane visualizer: original SVG showing N parallel full-duplex lanes.
 * Each lane draws a transmit path (→) and a receive path (←).
 * The lane count follows Link A's width control.
 */
import { el } from '../dom.js';

const LANE_H = 26;
const HEADER_H = 34;
const WIDTH = 720;

export function buildLaneVisualizer(): { section: HTMLElement; setLanes: (n: number) => void } {
  const section = el(
    'section',
    { id: 'lanes', class: 'section lanes' },
    el(
      'div',
      { class: 'section-head' },
      el('p', { class: 'eyebrow' }, '02 · Lane visualizer'),
      el('h2', {}, 'What x16 actually means'),
      el(
        'p',
        { class: 'lede' },
        'A PCIe link is a set of parallel lanes. Each lane is a ',
        el('strong', {}, 'full-duplex pair'),
        ' of differential signaling paths: one transmitting, one receiving. Change the Link A width in the explorer and the diagram follows.',
      ),
    ),
  );

  const countLabel = el('span', { class: 'lane-count' }, '');
  const wrap = el('div', { class: 'lane-wrap' });
  const svg = elNS('svg', {
    class: 'lane-svg',
    role: 'img',
    'aria-label': '',
    preserveAspectRatio: 'xMidYMin meet',
  });
  const defs = elNS('defs', {});
  const markerTx = elNS('marker', {
    id: 'arrow-tx',
    viewBox: '0 0 10 10',
    refX: '8',
    refY: '5',
    markerWidth: '7',
    markerHeight: '7',
    orient: 'auto-start-reverse',
  });
  markerTx.append(elNS('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'var(--accent-tx)' }));
  const markerRx = elNS('marker', {
    id: 'arrow-rx',
    viewBox: '0 0 10 10',
    refX: '8',
    refY: '5',
    markerWidth: '7',
    markerHeight: '7',
    orient: 'auto-start-reverse',
  });
  markerRx.append(elNS('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'var(--accent-rx)' }));
  defs.append(markerTx, markerRx);
  svg.append(defs);
  wrap.append(
    el(
      'p',
      { class: 'lane-caption' },
      el('span', { class: 'legend-key' }, 'Link A:'),
      countLabel,
      el('span', { class: 'legend-hint' }, 'parallel full-duplex lanes'),
    ),
  );
  wrap.append(svg);

  const header = elNS('g', { class: 'lane-header' });
  header.append(
    elNS('text', { x: '36', y: '22', class: 'lane-h-tx' }, 'TRANSMIT →'),
    elNS(
      'text',
      { x: String(WIDTH - 36), y: '22', class: 'lane-h-rx', 'text-anchor': 'end' },
      '← RECEIVE',
    ),
  );
  svg.append(header);

  const lanesG = elNS('g', {});
  svg.append(lanesG);

  let current = 0;

  function setLanes(n: number) {
    if (n === current) return;
    current = n;
    countLabel.textContent = `×${n}: ${n} lane${n === 1 ? '' : 's'}`;
    const height = HEADER_H + n * LANE_H + 10;
    svg.setAttribute('viewBox', `0 0 ${WIDTH} ${height}`);
    svg.setAttribute(
      'aria-label',
      `Diagram of ${n} parallel PCIe lanes. Each lane carries a transmit path to the right and a receive path to the left, so every lane is full duplex.`,
    );
    svg.classList.toggle('tall', n >= 16);

    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const y = HEADER_H + i * LANE_H;
      const row = elNS('g', { class: 'lane-row' });
      row.append(
        elNS('rect', {
          class: 'lane-box',
          x: '24',
          y: String(y),
          width: String(WIDTH - 48),
          height: String(LANE_H - 6),
          rx: '4',
        }),
      );
      // TX arrow (left → right), top of the lane
      const txY = y + (LANE_H - 6) / 2 - 4;
      row.append(
        elNS('line', {
          class: 'lane-tx',
          x1: '48',
          y1: String(txY),
          x2: String(WIDTH - 48),
          y2: String(txY),
          'marker-end': 'url(#arrow-tx)',
        }),
      );
      // RX arrow (right → left), bottom of the lane
      const rxY = y + (LANE_H - 6) / 2 + 5;
      row.append(
        elNS('line', {
          class: 'lane-rx',
          x1: String(WIDTH - 48),
          y1: String(rxY),
          x2: '48',
          y2: String(rxY),
          'marker-end': 'url(#arrow-rx)',
        }),
      );
      frag.append(row);
    }
    lanesG.replaceChildren(frag);
  }

  section.append(
    wrap,
    el(
      'details',
      { class: 'lane-notes hideable hideable-card' },
      el('summary', {}, 'Reading the diagram'),
      el(
        'ul',
        {},
        li(
          'A lane is a full-duplex pair of differential signaling paths: one transmit direction, one receive direction.',
        ),
        li(
          'A link can negotiate fewer lanes, or a lower generation, than the physical slot or device maximum allows.',
        ),
        li(
          'A connector that is physically ×16 may be wired for fewer lanes (for example ×8 or ×4). Physical slot size is not electrical lane count.',
        ),
        li(
          'The actual link is constrained by both endpoints, the motherboard/CPU/chipset wiring, firmware and platform topology.',
        ),
        li(
          'Backward-compatible negotiation does not guarantee a device will run at its advertised maximum width or speed on every platform.',
        ),
      ),
    ),
  );

  return { section, setLanes };
}

function li(text: string) {
  return el('li', {}, text);
}

function elNS<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: Array<Node | string | null | undefined>
): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child);
  }
  return node;
}
