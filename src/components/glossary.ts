/** Compact glossary: native <details>/<summary>, keyboard accessible, no JS. */
import { el, w } from '../dom.js';

const TERMS: Array<{ term: string; def: string }> = [
  {
    term: 'Lane / link width (×1, ×4, ×8, ×16)',
    def: 'A lane is one pair of differential signaling paths in each direction, so one full-duplex channel. A ×4 link has four such lanes and roughly four times the bandwidth of ×1 at the same generation. Slot size is not lane count: a physically ×16 slot can be wired for ×8 or ×4.',
  },
  {
    term: 'GT/s vs Gbps',
    def: 'GT/s means giga-transfers per second, the number of symbols the PHY pushes per lane per second. Gbps means gigabits per second of data. They are equal only after encoding is accounted for: PCIe 1.x/2.x lose 20% to 8b/10b encoding (2.5 GT/s ≈ 2.0 Gbps of data per lane), PCIe 3.0–5.0 lose ~1.5% to 128b/130b.',
  },
  {
    term: 'GB/s vs Gbps',
    def: 'GB/s is gigabytes per second; Gbps is gigabits per second. One byte is 8 bits, so divide Gbps by 8 to get GB/s (10 Gbps = 1.25 GB/s). This site uses decimal units: 1 GB = 1,000 MB, not 1,024.',
  },
  {
    term: 'Encoding efficiency (8b/10b, 128b/130b)',
    def: 'Line encoding adds overhead so the receiver can keep clock sync. 8b/10b sends 8 useful bits per 10 bits on the wire (80% efficient). 128b/130b sends 128 useful bits per 130 (≈98.5% efficient), which is why PCIe 3.0 doubled throughput at only a 1.6× rate increase.',
  },
  {
    term: 'PAM4',
    def: 'Pulse-amplitude modulation with 4 levels: each symbol carries 2 bits instead of the 1 bit that NRZ carries. PCIe 6.0 and 7.0 use PAM4 to double bits-per-transfer at a given GT/s. The trade-off is a noisier signal, which is why those generations move to FLIT mode with FEC.',
  },
  {
    term: 'FLIT and FEC',
    def: 'A FLIT (flow control unit) is a fixed-size transmission block. PCIe 6.0+ transmits FLITs and adds forward error correction (FEC) plus CRC so receivers can correct bit errors instead of resending whole transactions. The framing overhead means real payload sits below the headline rate.',
  },
  {
    term: 'Full duplex vs bidirectional aggregate',
    def: 'A full-duplex link sends both directions at once. If one direction carries 31.5 GB/s, the bidirectional aggregate is 63 GB/s, but no single stream ever sees more than 31.5 GB/s. The site keeps the two figures separate and labels them.',
  },
  {
    term: 'PHY rate vs application throughput (goodput)',
    def: 'The PHY rate is the maximum of the physical layer. Application throughput (goodput) is what your file manager actually moves after every protocol layer, error correction, storage speed and system limits. Goodput is always lower, sometimes far lower.',
  },
  {
    term: 'Connector vs protocol vs cable',
    def: 'A connector (USB-C, PCIe edge connector) is a shape; a protocol (USB4, PCIe 5.0) defines rules and rates; a cable carries the signal. The same connector can carry several protocols at several speeds, so a port label tells you the shape, not the speed.',
  },
];

export function buildGlossary(): HTMLElement {
  const section = el(
    'section',
    { id: 'glossary', class: 'section glossary' },
    el(
      'div',
      { class: 'section-head' },
      el('p', { class: 'eyebrow' }, '05 · Terms'),
      el('h2', {}, w('Explain the terms')),
      el(
        'p',
        { class: 'lede' },
        'Short, plain-English definitions of the vocabulary this page uses.',
      ),
    ),
  );

  const list = el('div', { class: 'term-list' });
  for (const t of TERMS) {
    const d = el(
      'details',
      {},
      el('summary', { class: 'term' }, t.term),
      el('p', { class: 'term-def' }, t.def),
    );
    list.append(d);
  }
  section.append(list);
  return section;
}
