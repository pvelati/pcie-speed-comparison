import './styles.css';
import { el } from './dom.js';
import { DATA_CHECKED, LANE_WIDTHS, PCIE_GENERATIONS } from './data/standards.js';
import { buildExplorer } from './components/explorer.js';
import { buildCrossLink } from './components/crosslink.js';
import type { ExplorerState } from './components/explorer.js';
import type { CrossLinkState } from './components/crosslink.js';
import { ALL_ROWS, TABS } from './components/compare.js';
import { familyIcon, FAMILY_ICON, logoMark } from './components/icons.js';
import { buildComparison } from './components/compare.js';
import { buildExamples } from './components/examples.js';
import { buildGlossary } from './components/glossary.js';
import { buildSources } from './components/sources.js';

const HERO_FAMILIES = [
  { tab: 'PCIe', name: 'PCIe' },
  { tab: 'USB', name: 'USB' },
  { tab: 'HDMI', name: 'HDMI' },
  { tab: 'Ethernet', name: 'Ethernet' },
  { tab: 'Wi-Fi', name: 'Wi-Fi' },
  { tab: 'Memory', name: 'RAM (DDR)' },
];

function heroChips() {
  const strip = el('div', { class: 'hero-chips' });
  for (const f of HERO_FAMILIES) {
    const count = ALL_ROWS.filter((r) => r.family === f.tab).length;
    const chip = el(
      'a',
      {
        class: `hero-chip chip-${f.tab.toLowerCase().replace(/[^a-z]/g, '')}`,
        href: '#compare',
        'data-filter': f.tab,
      },
      familyIcon(FAMILY_ICON[f.tab], 20),
      el('span', { class: 'chip-name' }, f.name),
      el('span', { class: 'chip-count' }, String(count)),
    );
    chip.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('ba:select-family', { detail: f.tab })),
    );
    strip.append(chip);
  }
  return strip;
}

function header() {
  const docEl = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const sun = familyIcon('sun', 20);
  sun.classList.add('icon-sun');
  const moon = familyIcon('moon', 20);
  moon.classList.add('icon-moon');
  const themeBtn = el(
    'button',
    {
      class: 'theme-toggle',
      id: 'theme-toggle',
      type: 'button',
      'aria-pressed': 'false',
      'aria-label': 'Switch to light theme',
    },
    sun,
    moon,
  );
  const syncTheme = () => {
    const light = docEl.classList.contains('light');
    themeBtn.setAttribute('aria-pressed', String(light));
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    if (meta) meta.setAttribute('content', light ? '#f3f6fb' : '#0a0f1e');
  };
  themeBtn.addEventListener('click', () => {
    const light = !docEl.classList.contains('light');
    docEl.classList.toggle('light', light);
    try {
      localStorage.setItem('ba-theme', light ? 'light' : 'dark');
    } catch {
      /* storage unavailable */
    }
    syncTheme();
  });
  syncTheme();
  return el(
    'header',
    { class: 'site-header' },
    el('a', { class: 'brand', href: '#top' }, logoMark(22), el('span', {}, 'Bandwidth Atlas')),
    el(
      'nav',
      { class: 'site-nav', 'aria-label': 'Page sections' },
      el('a', { href: '#explorer' }, 'Explorer'),
      el('a', { href: '#compare' }, 'Compare'),
      el('a', { href: '#examples' }, 'Examples'),
      el('a', { href: '#glossary' }, 'Terms'),
      el('a', { href: '#sources' }, 'Sources'),
    ),
    themeBtn,
  );
}

function heroSection() {
  return el(
    'section',
    { class: 'hero', id: 'top' },
    el('p', { class: 'eyebrow' }, 'Bandwidth Atlas · a field guide to interface speeds'),
    el('h1', {}, 'PCIe Speed Explorer'),
    el(
      'p',
      { class: 'hero-sub' },
      'Understand every lane. Bandwidth figures for PCI Express, compared with USB, HDMI, ',
      'Ethernet, Wi-Fi and RAM (DDR), each cited to its standard.',
    ),
    el('p', { class: 'hero-updated' }, `Last updated: ${DATA_CHECKED}`),
    heroChips(),
    el(
      'p',
      { class: 'hero-ctas' },
      el('a', { class: 'btn btn-primary', href: '#explorer' }, 'Open the explorer'),
      el('a', { class: 'btn', href: '#sources' }, 'How the numbers are calculated'),
    ),
  );
}

function footer() {
  return el(
    'footer',
    { class: 'site-footer' },
    el(
      'p',
      {},
      'Bandwidth Atlas is a static, single-page reference. No cookies, no tracking, no external requests. ',
      'All data is cited in the ',
      el('a', { href: '#sources' }, 'sources'),
      ' section.',
    ),
  );
}

// -- shareable state: explorer + crosslink + tab in the URL hash --------

const ROW_IDS = new Set(ALL_ROWS.map((r) => r.id));
const UNITS = ['gbps', 'gbit', 'mbps', 'tbps'];

function parseHash(hash: string): {
  explorer: Partial<ExplorerState>;
  cross: Partial<CrossLinkState>;
  tab?: string;
} {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const out: {
    explorer: Partial<ExplorerState>;
    cross: Partial<CrossLinkState>;
    tab?: string;
  } = { explorer: {}, cross: {} };
  const inRange = (key: string, min: number, max: number) => {
    const v = Number(p.get(key));
    return p.has(key) && Number.isInteger(v) && v >= min && v <= max ? v : undefined;
  };
  const link = (key: string) => {
    const [g, l] = (p.get(key) ?? '').split('-').map(Number);
    if (
      Number.isInteger(g) &&
      Number.isInteger(l) &&
      PCIE_GENERATIONS.some((x) => x.generation === g) &&
      (LANE_WIDTHS as readonly number[]).includes(l)
    ) {
      return { gen: g, lanes: l };
    }
    return null;
  };
  const a = link('a');
  if (a) {
    out.explorer.genA = a.gen;
    out.explorer.lanesA = a.lanes;
  }
  const b = link('b');
  if (b) {
    out.explorer.genB = b.gen;
    out.explorer.lanesB = b.lanes;
  }
  const o = inRange('o', 0, 40);
  if (o !== undefined) out.explorer.overhead = o;
  const ca = p.get('ca');
  if (ca && ROW_IDS.has(ca)) out.cross.a = ca;
  const cb = p.get('cb');
  if (cb && ROW_IDS.has(cb)) out.cross.b = cb;
  const coa = inRange('coa', 0, 40);
  if (coa !== undefined) out.cross.ohA = coa;
  const cob = inRange('cob', 0, 40);
  if (cob !== undefined) out.cross.ohB = cob;
  const cha = inRange('cha', 1, 8);
  if (cha !== undefined && CHANNELS.includes(cha)) out.cross.chA = cha;
  const chb = inRange('chb', 1, 8);
  if (chb !== undefined && CHANNELS.includes(chb)) out.cross.chB = chb;
  const u = p.get('u');
  if (u && UNITS.includes(u)) out.cross.unit = u;
  const t = p.get('t');
  if (t) out.tab = t;
  return out;
}

// Must match the component defaults (explorer Gen4 x16 / Gen3 x4 / 0%,
// crosslink DDR5 0% / PCIe 4.0 10% / GB/s, tab All).
const D = {
  genA: 4,
  lanesA: 16,
  genB: 3,
  lanesB: 4,
  overhead: 0,
  a: 'ddr5',
  ohA: 0,
  chA: 1,
  b: 'pcie-4',
  ohB: 10,
  chB: 1,
  unit: 'gbps',
  tab: 'All',
};

const CHANNELS = [1, 2, 4, 8];

/** Only non-default fields go into the hash; '' when everything is default. */
function serializeHash(ex: ExplorerState, cl: CrossLinkState, tab: string): string {
  const p = new URLSearchParams();
  if (ex.genA !== D.genA || ex.lanesA !== D.lanesA) p.set('a', `${ex.genA}-${ex.lanesA}`);
  if (ex.genB !== D.genB || ex.lanesB !== D.lanesB) p.set('b', `${ex.genB}-${ex.lanesB}`);
  if (ex.overhead !== D.overhead) p.set('o', String(ex.overhead));
  if (cl.a !== D.a) p.set('ca', cl.a);
  if (cl.ohA !== D.ohA) p.set('coa', String(cl.ohA));
  if (cl.b !== D.b) p.set('cb', cl.b);
  if (cl.ohB !== D.ohB) p.set('cob', String(cl.ohB));
  if (cl.chA !== D.chA) p.set('cha', String(cl.chA));
  if (cl.chB !== D.chB) p.set('chb', String(cl.chB));
  if (cl.unit !== D.unit) p.set('u', cl.unit);
  if (tab !== D.tab) p.set('t', tab);
  return p.toString();
}

function main() {
  let tab = 'All';
  let raf = 0;
  const scheduleHash = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const h = serializeHash(explorer.get(), cross.get(), tab);
      const next = location.pathname + location.search + (h ? `#${h}` : '');
      if (location.pathname + location.search + location.hash !== next) {
        history.replaceState(null, '', next);
      }
    });
  };

  const explorer = buildExplorer(scheduleHash);
  const cross = buildCrossLink(scheduleHash);
  const comparison = buildComparison(cross, (name) => {
    tab = name;
    scheduleHash();
  });

  const app = el(
    'div',
    { class: 'page' },
    header(),
    el(
      'main',
      { id: 'main' },
      heroSection(),
      explorer.root,
      comparison,
      buildExamples(),
      buildGlossary(),
      buildSources(),
    ),
    footer(),
  );

  const root = document.getElementById('app');
  if (!root) throw new Error('#app root missing');
  root.replaceChildren(app);

  const applyHash = () => {
    const s = parseHash(location.hash);
    explorer.set(s.explorer);
    cross.set(s.cross);
    if (s.tab) {
      const tab = TABS.find((x) => x.toLowerCase() === s.tab!.toLowerCase());
      if (tab) document.dispatchEvent(new CustomEvent('ba:select-family', { detail: tab }));
    }
  };
  if (location.hash) applyHash();
  window.addEventListener('hashchange', applyHash);

  navScrollSpy();
}

/** Highlights the nav link of the section currently in view. */
function navScrollSpy() {
  const links: HTMLAnchorElement[] = [
    ...document.querySelectorAll<HTMLAnchorElement>('.site-nav a[href^="#"]'),
  ];
  const sections = links
    .map((a) => document.getElementById(a.getAttribute('href')!.slice(1)))
    .filter((s): s is HTMLElement => s !== null);

  let ticking = false;
  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.3;
    let current: string | null = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) current = s.id;
    }
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

main();
