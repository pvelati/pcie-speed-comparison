import './styles.css';
import { el } from './dom.js';
import { PCIE_GENERATIONS } from './data/standards.js';
import { linkMetrics } from './lib/pcie.js';
import { withUnit } from './lib/format.js';
import { buildExplorer } from './components/explorer.js';
import { buildLaneVisualizer } from './components/lanes.js';
import { buildComparison } from './components/compare.js';
import { buildExamples } from './components/examples.js';
import { buildGlossary } from './components/glossary.js';
import { buildSources } from './components/sources.js';

const gen7 = PCIE_GENERATIONS.find((g) => g.generation === 7)!;
const hero = linkMetrics(gen7, 16);

function header() {
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
      'Understand every lane. Interactive, source-cited bandwidth figures for PCI Express — ',
      'placed on an honest scale next to USB, HDMI, Ethernet and Wi-Fi.',
    ),
    el(
      'div',
      { class: 'hero-figure', 'aria-label': 'PCIe 7.0 ×16 headline figure' },
      el(
        'div',
        { class: 'hero-number' },
        el('span', { class: 'num' }, '512'),
        el('small', {}, 'GB/s'),
      ),
      el(
        'p',
        { class: 'hero-figure-caption' },
        el('strong', {}, 'PCIe 7.0 ×16 — up to, bidirectional aggregate'),
        ' per PCI-SIG. Each direction carries ',
        el('strong', {}, withUnit(hero.oneWayGBps, 'GB/s')),
        '; 512 GB/s is their sum, not a one-way rate.',
      ),
      el(
        'div',
        { class: 'hero-split', 'aria-hidden': 'true' },
        el('span', {}, `256 GB/s →`),
        el('span', { class: 'hero-split-mid' }, '×16 full-duplex lanes'),
        el('span', {}, `← 256 GB/s`),
      ),
    ),
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
      'Bandwidth Atlas — a static, single-page reference. No cookies, no tracking, no external requests: ',
      'all data is cited in the ',
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
  root.append(app);
}

main();
