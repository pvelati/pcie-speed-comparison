import './styles.css';
import { el } from './dom.js';
import { DATA_CHECKED } from './data/standards.js';
import { buildExplorer } from './components/explorer.js';
import { ALL_ROWS } from './components/compare.js';
import { familyIcon, FAMILY_ICON } from './components/icons.js';
import { buildLaneVisualizer } from './components/lanes.js';
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
    el(
      'a',
      { class: 'brand', href: '#top' },
      el('span', { class: 'brand-mark', 'aria-hidden': 'true' }, '▤'),
      el('span', {}, 'Bandwidth Atlas'),
    ),
    el(
      'nav',
      { class: 'site-nav', 'aria-label': 'Page sections' },
      el('a', { href: '#explorer' }, 'Explorer'),
      el('a', { href: '#lanes' }, 'Lanes'),
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

function main() {
  const lanes = buildLaneVisualizer();

  const app = el(
    'div',
    { class: 'page' },
    header(),
    el(
      'main',
      { id: 'main' },
      heroSection(),
      buildExplorer((lanesCount) => lanes.setLanes(lanesCount)),
      lanes.section,
      buildComparison(),
      buildExamples(),
      buildGlossary(),
      buildSources(),
    ),
    footer(),
  );

  const root = document.getElementById('app');
  if (!root) throw new Error('#app root missing');
  root.replaceChildren(app);

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
