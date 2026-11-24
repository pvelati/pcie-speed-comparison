/**
 * Comparison of PCIe against USB, HDMI, Ethernet and Wi-Fi.
 * Logarithmic chart (CSS/SVG-free, pure DOM) + accessible data table.
 */
import {
  INTERFACE_RATES,
  PCIE_GENERATIONS,
  ROADMAP_ITEMS,
  type InterfaceFamily,
  type RateKind,
  type RateStatus,
} from '../data/standards.js';
import { familyIcon, FAMILY_ICON } from './icons.js';
import { type CrossLinkHandle } from './crosslink.js';
import { SOURCES_BY_ID } from '../data/sources.js';
import { linkMetrics } from '../lib/pcie.js';
import { formatRate } from '../lib/format.js';
import { CHART_TICKS, logPosition } from '../lib/logscale.js';
import { el, w } from '../dom.js';

export interface ChartRow {
  id: string;
  family: 'PCIe' | InterfaceFamily;
  label: string;
  rateGbps: number;
  displayRate: string;
  rateKind: RateKind;
  rateMeaning: string;
  directionality: string;
  status: RateStatus;
  caveat?: string;
  sourceIds: string[];
}

/** PCIe x16 one-way link ceilings, derived from the same tested math. */
export function pcieChartRows(): ChartRow[] {
  return PCIE_GENERATIONS.map((g) => {
    const m = linkMetrics(g, 16);
    return {
      id: `pcie-${g.generation}`,
      family: 'PCIe',
      label: `${g.label} ×16`,
      rateGbps: m.oneWayGbps,
      displayRate: `${formatRate(m.oneWayGbps)} Gbps`,
      rateKind: 'link',
      rateMeaning: 'Theoretical one-way link ceiling per direction (×16).',
      directionality: 'Full duplex; per-direction value shown, the aggregate would be double.',
      status: g.status ?? 'standard',
      caveat:
        g.family === 'pam4-flit'
          ? 'Nominal PCI-SIG headline ceiling (FLIT/FEC overhead included at the spec level).'
          : undefined,
      sourceIds: g.sourceIds,
    };
  });
}

export const ALL_ROWS: ChartRow[] = [
  ...pcieChartRows(),
  ...INTERFACE_RATES.map((r) => ({ ...r, rateKind: r.rateKind })),
].sort((a, b) => b.rateGbps - a.rateGbps);

export const TABS = ['All', 'PCIe', 'USB', 'HDMI', 'Ethernet', 'Wi-Fi', 'Memory'] as const;

function countFor(tab: (typeof TABS)[number]): number {
  return tab === 'All' ? ALL_ROWS.length : ALL_ROWS.filter((r) => r.family === tab).length;
}
type Tab = (typeof TABS)[number];

export const STATUS_LABEL: Record<RateStatus, string> = {
  standard: 'Ratified standard',
  'published-spec': 'Published spec',
  'vendor-example': 'Vendor example',
  roadmap: 'Roadmap',
  future: 'Future, not released',
};

const RATE_KIND_LABEL: Record<RateKind, string> = {
  signaling: 'signaling rate',
  link: 'link rate',
  PHY: 'PHY rate',
  theoretical: 'theoretical maximum',
};

const ORG_SHORT: Array<[RegExp, string]> = [
  [/^pcisig-/, 'PCI-SIG'],
  [/^usb-/, 'USB-IF'],
  [/^hdmi-/, 'HDMI'],
  [/^ieee-/, 'IEEE'],
  [/^ea-/, 'Ethernet Alliance'],
  [/^wifi-alliance-/, 'Wi-Fi Alliance'],
  [/^intel-/, 'Intel'],
  [/^jedec-/, 'JEDEC'],
];

function orgShort(id: string): string {
  return ORG_SHORT.find(([re]) => re.test(id))?.[1] ?? 'Source';
}

function sourceLinks(ids: string[]) {
  const cell = el('span', { class: 'src-links' });
  for (const id of ids) {
    const src = SOURCES_BY_ID.get(id);
    if (!src) continue;
    cell.append(
      el(
        'a',
        { href: src.url, class: 'src-link', title: src.name, 'aria-label': `Source: ${src.name}` },
        orgShort(id),
      ),
    );
  }
  return cell;
}

const FAMILY_NOTES: Record<Exclude<Tab, 'All' | 'PCIe'>, string> = {
  USB: 'USB naming has changed repeatedly (3.0 → 3.1 → 3.2). USB-C is a connector shape, not a speed guarantee, and USB4 can dynamically share bandwidth between tunneled data and display protocols.',
  HDMI: 'HDMI bandwidth is a display/audio signal path, not a general-purpose file-transfer interface. Its figures are not directly equivalent to PCIe application data throughput.',
  Ethernet:
    'A nominal link rate is not application goodput. Media and PHY variants differ (twisted pair, fiber, backplane, DAC), so the speed label alone does not identify the cable or its reach.',
  'Wi-Fi':
    'Wi-Fi is a shared wireless medium: PHY rates divide among all clients and depend on channel width, streams, modulation, SNR, distance, interference and regulatory domain. Never read a PHY rate as a guaranteed per-client file-transfer speed.',
  Memory:
    'DRAM bandwidth is a per-channel figure (64-bit bus; 96-bit in the DDR6 preview). A system multiplies the per-channel rate by its channel count (two on most desktops, more in servers). DRAM is a shared read/write bus: the number shown is total channel bandwidth, not a one-way rate, and pin transfer rates (MT/s) are not one-way link rates like PCIe.',
};

export function buildComparison(
  cross: CrossLinkHandle,
  onTabChange?: (tab: string) => void,
): HTMLElement {
  const section = el(
    'section',
    { id: 'compare', class: 'section compare' },
    el(
      'div',
      { class: 'section-head' },
      el('p', { class: 'eyebrow' }, '03 · Scale check'),
      el(
        'h2',
        {},
        w('PCIe vs'),
        ' ',
        w('USB,'),
        ' ',
        w('HDMI,'),
        ' ',
        w('Ethernet,'),
        ' ',
        w('Wi-Fi'),
        ' ',
        w('and RAM'),
      ),
      el(
        'p',
        { class: 'lede' },
        'Each row is labeled with ',
        el('strong', {}, 'what the number measures'),
        ': signaling rate, link rate, PHY rate, theoretical ceiling, or per-channel memory bandwidth. Read this as a scale reference, not a ranking.',
      ),
    ),
  );

  const tablist = el('div', {
    class: 'tablist',
    role: 'tablist',
    'aria-label': 'Interface family filter',
  });
  const panels = el('div', {});

  const rowsFor = (tab: Tab): ChartRow[] =>
    tab === 'All' ? ALL_ROWS : ALL_ROWS.filter((r) => r.family === tab);

  const buildTabButton = (tab: Tab, active: boolean) => {
    const count = countFor(tab);
    const children: Array<Node | string> = [];
    if (tab !== 'All') children.push(familyIcon(FAMILY_ICON[tab], 16));
    children.push(el('span', { class: 'tab-label' }, tab));
    const btn = el(
      'button',
      {
        class: 'tab-btn',
        type: 'button',
        role: 'tab',
        id: `tab-${tab.toLowerCase()}`,
        'aria-selected': String(active),
        'aria-controls': `panel-${tab.toLowerCase()}`,
        tabindex: active ? '0' : '-1',
      },
      ...children,
      el('span', { class: 'tab-count', 'aria-label': `${count} standards` }, String(count)),
    );
    btn.addEventListener('click', () => selectTab(tab, btn));
    return btn;
  };

  const buildChartRow = (row: ChartRow) => {
    const label = el(
      'span',
      { class: 'chart-label' },
      el('span', { class: 'chart-name' }, familyIcon(FAMILY_ICON[row.family], 15), row.label),
      el('span', { class: 'chart-rate' }, row.displayRate),
    );
    const track = el('div', { class: 'chart-track' });
    for (const tick of CHART_TICKS) {
      track.append(
        el('span', {
          class: 'chart-tickline',
          style: `left:${(logPosition(tick.value) * 100).toFixed(3)}%`,
        }),
      );
    }
    // The slowest row (10 Mbps) sits exactly on the log-scale minimum, which
    // maps to zero width. Clamp to a small visible sliver so it is never
    // invisible; decade gridlines stay at their exact log positions.
    const barPct = Math.max(logPosition(row.rateGbps) * 100, 1.5);
    const bar = el('span', {
      class: `chart-bar bar-${row.family.toLowerCase().replace(/\s/g, '-')}`,
      style: `width:${barPct.toFixed(3)}%`,
      title: `${row.label}: ${row.displayRate}. ${row.rateMeaning} ${row.directionality}`,
    });
    track.append(bar);
    const value = el('span', { class: 'chart-value' }, row.displayRate);
    return el('div', { class: 'chart-row' }, label, track, value);
  };

  const buildScale = () => {
    const scale = el('div', { class: 'chart-scale' });
    for (const tick of CHART_TICKS) {
      scale.append(
        el(
          'span',
          {
            class: 'chart-scale-tick',
            style: `left:${(logPosition(tick.value) * 100).toFixed(3)}%`,
          },
          tick.label,
        ),
      );
    }
    return scale;
  };

  const buildTable = (rows: ChartRow[]) => {
    const head = el(
      'thead',
      {},
      el(
        'tr',
        {},
        th('Standard'),
        th('Rate'),
        th('What it measures'),
        th('Direction'),
        th('Status'),
        th('Note'),
        th('Source'),
      ),
    );
    const body = el('tbody', {});
    for (const row of rows) {
      body.append(
        el(
          'tr',
          {},
          el('th', { scope: 'row' }, el('span', { class: 'row-fam' }, row.family), ' ', row.label),
          el('td', { class: 'td-rate', 'data-label': 'Rate' }, row.displayRate),
          el(
            'td',
            { 'data-label': 'What it measures' },
            `${row.rateMeaning} (${RATE_KIND_LABEL[row.rateKind]})`,
          ),
          el('td', { 'data-label': 'Direction' }, row.directionality),
          el(
            'td',
            { 'data-label': 'Status' },
            el('span', { class: `status status-${row.status}` }, STATUS_LABEL[row.status]),
          ),
          el('td', { class: 'td-note', 'data-label': 'Note' }, row.caveat ?? 'n/a'),
          el('td', { 'data-label': 'Source' }, sourceLinks(row.sourceIds)),
        ),
      );
    }
    return el(
      'table',
      { class: 'data-table' },
      el(
        'caption',
        { class: 'table-caption' },
        'Reference rates: headline specification values. Ratified standard = approved standard; Published spec = published specification not yet broadly deployed; Vendor example = a concrete vendor product figure; Roadmap = future, not ratified.',
      ),
      head,
      body,
    );
  };

  let activeTab: Tab = 'All';
  const resultCount = el('p', { class: 'result-count', 'aria-live': 'polite' }, '');

  function renderPanel(tab: Tab) {
    const rows = rowsFor(tab);
    const chart = el(
      'div',
      { class: 'chart' },
      el(
        'div',
        { class: 'chart-scale-row' },
        el('span', { class: 'chart-corner' }),
        buildScale(),
        el('span', {}),
      ),
      ...rows.map(buildChartRow),
    );
    const scaleNote = el(
      'p',
      { class: 'scale-note' },
      el('strong', {}, 'Logarithmic scale.'),
      ' Each gridline is ×10 the previous, so 10 Mbps and 800 Gbps stay readable together. Slow technologies are not squeezed to zero.',
    );
    const notes = el('div', { class: 'family-notes' });
    if (tab === 'All' || tab === 'PCIe') {
      notes.append(
        el(
          'p',
          { class: 'family-note note-pcie' },
          'PCIe rows show one-way (per-direction) ×16 link ceilings. The same links carry the same amount in the other direction at the same time (full duplex). PCIe 6.0 and 7.0 are specified but not yet shipping products.',
        ),
      );
    }
    if (tab === 'All' || tab === 'USB')
      notes.append(el('p', { class: 'family-note note-usb' }, FAMILY_NOTES.USB));
    if (tab === 'All' || tab === 'HDMI')
      notes.append(el('p', { class: 'family-note note-hdmi' }, FAMILY_NOTES.HDMI));
    if (tab === 'All' || tab === 'Ethernet')
      notes.append(el('p', { class: 'family-note note-eth' }, FAMILY_NOTES.Ethernet));
    if (tab === 'All' || tab === 'Wi-Fi')
      notes.append(el('p', { class: 'family-note note-wifi' }, FAMILY_NOTES['Wi-Fi']));
    if (tab === 'All' || tab === 'Memory')
      notes.append(el('p', { class: 'family-note note-memory' }, FAMILY_NOTES.Memory));

    const roadmap = el(
      'div',
      { class: 'roadmap-strip' },
      el('h3', {}, 'Emerging / roadmap: not part of the ratified list above'),
      ...ROADMAP_ITEMS.map((item) =>
        el(
          'p',
          { class: 'roadmap-item' },
          el('span', { class: 'roadmap-label' }, item.label),
          el('span', { class: 'roadmap-rate' }, item.displayRate),
          '. ',
          item.note,
          ' ',
          sourceLinks(item.sourceIds),
        ),
      ),
    );

    const panel = el(
      'div',
      {
        class: 'tab-panel',
        role: 'tabpanel',
        id: `panel-${tab.toLowerCase()}`,
        'aria-labelledby': `tab-${tab.toLowerCase()}`,
      },
      chart,
      scaleNote,
      el(
        'details',
        { class: 'notes-details hideable hideable-bare', open: true },
        el('summary', {}, 'Caveats for this family'),
        notes,
      ),
      roadmap,
      buildTable(rows),
    );
    return panel;
  }

  document.addEventListener('ba:select-family', ((e: Event) => {
    const name = (e as CustomEvent<string>).detail;
    const btn = tablist.querySelector<HTMLButtonElement>(`#tab-${name.toLowerCase()}`);
    if (btn && (TABS as readonly string[]).includes(name)) selectTab(name as Tab, btn);
  }) as EventListener);

  function selectTab(tab: Tab, btn: HTMLButtonElement) {
    activeTab = tab;
    const shown = rowsFor(activeTab).length;
    resultCount.textContent =
      shown === ALL_ROWS.length
        ? `${shown} standards shown`
        : `${shown} of ${ALL_ROWS.length} standards shown`;
    tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach((t) => {
      const isActive = t === btn;
      t.setAttribute('aria-selected', String(isActive));
      t.tabIndex = isActive ? 0 : -1;
      t.classList.toggle('active', isActive);
    });
    panels.replaceChildren(renderPanel(activeTab));
    onTabChange?.(tab);
  }

  // Arrow-key roving focus for the tablist
  tablist.addEventListener('keydown', (e) => {
    const idx = TABS.indexOf(activeTab);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = TABS.length - 1;
    if (next !== null) {
      e.preventDefault();
      const target = tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
      target.focus();
      target.click();
    }
  });

  for (const tab of TABS) tablist.append(buildTabButton(tab, tab === activeTab));
  selectTab(activeTab, tablist.querySelector<HTMLButtonElement>('[role="tab"]')!);

  section.append(tablist, resultCount, panels);
  section.insertBefore(cross.root, tablist);
  return section;
}

function th(text: string) {
  return el('th', { scope: 'col' }, text);
}
