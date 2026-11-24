/** Methodology + source list. Every family of standards is cited near its data. */
import { DATA_CHECKED } from '../data/standards.js';
import { SOURCES } from '../data/sources.js';
import { el } from '../dom.js';

const FAMILY_ORDER = ['PCI Express', 'USB', 'HDMI', 'Ethernet', 'Wi-Fi'] as const;

function familyOf(id: string): string {
  if (id.startsWith('pcisig')) return 'PCI Express';
  if (id.startsWith('usb')) return 'USB';
  if (id.startsWith('hdmi')) return 'HDMI';
  if (id.startsWith('ieee-802.3') || id.startsWith('ea-')) return 'Ethernet';
  return 'Wi-Fi';
}

export function buildSources(): HTMLElement {
  const section = el(
    'section',
    { id: 'sources', class: 'section sources' },
    el(
      'div',
      { class: 'section-head' },
      el('p', { class: 'eyebrow' }, '06 · Sources & methodology'),
      el('h2', {}, 'How these numbers are calculated'),
      el(
        'p',
        { class: 'lede' },
        'Values come from standards bodies and first-party specification documents only. ',
        el('span', { class: 'checked-badge' }, `Data checked: ${DATA_CHECKED}`),
      ),
    ),
  );

  const methodology = el(
    'div',
    { class: 'methodology' },
    el('h3', {}, 'PCIe generation math'),
    el('p', {}, 'For Gen 1–2 (NRZ, 8b/10b) the per-lane, one-direction encoded ceiling is:'),
    code('per lane (GB/s) = GT/s × (8 ÷ 10) ÷ 8'),
    el('p', {}, 'For Gen 3–5 (NRZ, 128b/130b):'),
    code('per lane (GB/s) = GT/s × (128 ÷ 130) ÷ 8'),
    el(
      'p',
      {},
      'For Gen 6–7 (PAM4, FLIT mode) the NRZ formulas do not apply. Instead we use the PCI-SIG published ',
      el('strong', {}, 'x16 bidirectional maximums'),
      ' — 256 GB/s for Gen 6 and 512 GB/s for Gen 7 — divide by two for one direction, then by sixteen for the per-lane value. These are nominal specification-level ceilings; FLIT framing and FEC overhead mean application payload is lower.',
    ),
    el('p', {}, 'For every configuration:'),
    code(
      'one-way (GB/s)      = per-lane (GB/s) × lanes\nbidirectional (GB/s) = one-way (GB/s) × 2      // both directions summed\ngigabit values      = gigabyte values × 8      // 1 byte = 8 bits',
    ),
    el(
      'p',
      {},
      'All units are decimal SI (1 GB = 1,000 MB). The bidirectional aggregate is always shown separately and never described as a one-way rate.',
    ),
    el('h3', {}, 'What the numbers are — and are not'),
    el(
      'ul',
      {},
      li(
        'PCIe figures are theoretical link-level ceilings, not guaranteed application throughput.',
      ),
      li('Gen 1–5 formulas account for line encoding only, not packet/protocol overhead.'),
      li(
        'USB/HDMI/Ethernet/Wi-Fi figures are headline specification rates, tagged with what they measure (signaling, link, PHY or theoretical) and their directionality.',
      ),
      li(
        'Status tags separate ratified standards, published specifications, vendor examples and roadmap items. Roadmap values (e.g. 1.6 Tb/s Ethernet) are kept out of the ratified comparison.',
      ),
      li(
        'A base-specification revision number (for example PCIe Base Spec 7.1) is not a new PCIe generation — the headline data rate is still PCIe 7.0 / 128.0 GT/s.',
      ),
    ),
  );

  const groups = el('div', { class: 'source-groups' });
  for (const family of FAMILY_ORDER) {
    const items = SOURCES.filter((s) => familyOf(s.id) === family);
    if (items.length === 0) continue;
    groups.append(
      el(
        'div',
        { class: 'source-group' },
        el('h3', {}, family),
        el(
          'ul',
          {},
          ...items.map((s) =>
            el(
              'li',
              {},
              el('a', { href: s.url }, s.name),
              el('span', { class: 'src-supports' }, s.supports),
            ),
          ),
        ),
      ),
    );
  }

  section.append(methodology, groups);
  return section;
}

function code(text: string) {
  return el('pre', { class: 'formula' }, el('code', {}, text));
}

function li(text: string) {
  return el('li', {}, text);
}
