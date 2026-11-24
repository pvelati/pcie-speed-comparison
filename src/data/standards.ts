/**
 * Spec-level reference data.
 *
 * Every number here is a maximum or headline specification rate, i.e. a
 * theoretical link/PHY ceiling, not a promise of application throughput.
 * `sourceIds` must reference entries in ./sources.ts.
 */

export type PcieEncodingFamily = '8b10b' | '128b130b' | 'pam4-flit';

export interface PcieGeneration {
  generation: number;
  label: string;
  rawRateGTs: number;
  /** Human-readable signaling/encoding description. */
  encoding: string;
  family: PcieEncodingFamily;
  /**
   * PCI-SIG published x16 bidirectional maximum, GB/s, for PAM4
   * (FLIT-mode) generations only. Gen 6: 256, Gen 7: 512.
   */
  x16BidirectionalGBps?: number;
  calculationNote: string;
  sourceIds: string[];
  /** 'future' = specification published, products not yet shipping. */
  status?: 'standard' | 'future';
}

/**
 * Raw signaling rates and encoding families per generation.
 * Gen 1–2: 8b/10b NRZ · Gen 3–5: 128b/130b NRZ · Gen 6–7: PAM4 + FLIT.
 */
export const PCIE_GENERATIONS: PcieGeneration[] = [
  {
    generation: 1,
    label: 'PCIe 1.x',
    rawRateGTs: 2.5,
    encoding: 'NRZ, 8b/10b encoding',
    family: '8b10b',
    calculationNote: '2.5 GT/s × (8/10) ÷ 8 = 0.25 GB/s per lane, one direction.',
    sourceIds: ['pcisig-cabling-webinar'],
  },
  {
    generation: 2,
    label: 'PCIe 2.x',
    rawRateGTs: 5.0,
    encoding: 'NRZ, 8b/10b encoding',
    family: '8b10b',
    calculationNote: '5.0 GT/s × (8/10) ÷ 8 = 0.5 GB/s per lane, one direction.',
    sourceIds: ['pcisig-cabling-webinar'],
  },
  {
    generation: 3,
    label: 'PCIe 3.0',
    rawRateGTs: 8.0,
    encoding: 'NRZ, 128b/130b encoding',
    family: '128b130b',
    calculationNote: '8.0 GT/s × (128/130) ÷ 8 ≈ 0.985 GB/s per lane, one direction.',
    sourceIds: ['pcisig-cabling-webinar'],
  },
  {
    generation: 4,
    label: 'PCIe 4.0',
    rawRateGTs: 16.0,
    encoding: 'NRZ, 128b/130b encoding',
    family: '128b130b',
    calculationNote: '16.0 GT/s × (128/130) ÷ 8 ≈ 1.969 GB/s per lane, one direction.',
    sourceIds: ['pcisig-cabling-webinar'],
  },
  {
    generation: 5,
    label: 'PCIe 5.0',
    rawRateGTs: 32.0,
    encoding: 'NRZ, 128b/130b encoding',
    family: '128b130b',
    calculationNote: '32.0 GT/s × (128/130) ÷ 8 ≈ 3.938 GB/s per lane, one direction.',
    sourceIds: ['pcisig-cabling-webinar'],
  },
  {
    generation: 6,
    label: 'PCIe 6.0',
    rawRateGTs: 64.0,
    encoding: 'PAM4, FLIT mode, FEC/CRC',
    family: 'pam4-flit',
    x16BidirectionalGBps: 256,
    status: 'future',
    calculationNote:
      'Nominal ceiling from PCI-SIG: 256 GB/s bidirectional x16 → 128 GB/s one-way → 8 GB/s per lane. FLIT/FEC framing means application payload is lower.',
    sourceIds: ['pcisig-60', 'pcisig-60-pam4'],
  },
  {
    generation: 7,
    label: 'PCIe 7.0',
    rawRateGTs: 128.0,
    status: 'future',
    encoding: 'PAM4, FLIT-based encoding',
    family: 'pam4-flit',
    x16BidirectionalGBps: 512,
    calculationNote:
      'Nominal ceiling from PCI-SIG: 512 GB/s bidirectional x16 → 256 GB/s one-way → 16 GB/s per lane. FLIT/FEC framing means application payload is lower.',
    sourceIds: ['pcisig-70-rate', 'pcisig-70-features'],
  },
];

/** Electrically supported link widths. x32 exists in the spec but is uncommon. */
export const LANE_WIDTHS = [1, 2, 4, 8, 16, 32] as const;
export type LaneWidth = (typeof LANE_WIDTHS)[number];

export const UNCOMMON_LANES = new Set<number>([32]);

// ---------------------------------------------------------------------------
// External interfaces
// ---------------------------------------------------------------------------

export type InterfaceFamily = 'USB' | 'HDMI' | 'Ethernet' | 'Wi-Fi' | 'Memory';
export type RateKind = 'signaling' | 'link' | 'PHY' | 'theoretical';
export type RateStatus = 'standard' | 'published-spec' | 'vendor-example' | 'roadmap' | 'future';

export interface InterfaceRate {
  id: string;
  family: InterfaceFamily;
  label: string;
  /** Numeric rate in Gbps, used for the log-scale chart. */
  rateGbps: number;
  /** Exactly what to display next to the name, e.g. "480 Mbps". */
  displayRate: string;
  /** What kind of number this is: raw signaling, link rate, PHY rate, or theoretical. */
  rateKind: RateKind;
  /** One sentence on what the number measures. */
  rateMeaning: string;
  /** Directionality tag. */
  directionality: string;
  status: RateStatus;
  caveat?: string;
  sourceIds: string[];
}

const FD = 'Full duplex, per direction';

export const INTERFACE_RATES: InterfaceRate[] = [
  // -- USB ------------------------------------------------------------------
  {
    id: 'usb2',
    family: 'USB',
    label: 'USB 2.0 (Hi-Speed)',
    rateGbps: 0.48,
    displayRate: '480 Mbps',
    rateKind: 'signaling',
    rateMeaning: 'Raw signaling rate on the wire.',
    directionality: 'Bidirectional over the same wires (host and device).',
    status: 'standard',
    caveat: 'Payload is lower after 8b/10b encoding and packet overhead (~440 Mbps effective).',
    sourceIds: ['usb-20-spec'],
  },
  {
    id: 'usb32g1',
    family: 'USB',
    label: 'USB 3.2 Gen 1',
    rateGbps: 5,
    displayRate: '5 Gbps',
    rateKind: 'signaling',
    rateMeaning: 'SuperSpeed signaling rate per direction.',
    directionality: FD,
    status: 'standard',
    caveat: 'Formerly "USB 3.0" / "3.1 Gen 1". USB-C is a connector shape, not a speed guarantee.',
    sourceIds: ['usb-32'],
  },
  {
    id: 'usb32g2',
    family: 'USB',
    label: 'USB 3.2 Gen 2',
    rateGbps: 10,
    displayRate: '10 Gbps',
    rateKind: 'signaling',
    rateMeaning: 'SuperSpeed signaling rate per direction.',
    directionality: FD,
    status: 'standard',
    caveat: 'Formerly "USB 3.1 Gen 2".',
    sourceIds: ['usb-32'],
  },
  {
    id: 'usb32g2x2',
    family: 'USB',
    label: 'USB 3.2 Gen 2×2',
    rateGbps: 20,
    displayRate: '20 Gbps',
    rateKind: 'signaling',
    rateMeaning: 'Two SuperSpeed lanes aggregated per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['usb-32'],
  },
  {
    id: 'usb4-20',
    family: 'USB',
    label: 'USB4 v1 (20 Gbps class)',
    rateGbps: 20,
    displayRate: '20 Gbps',
    rateKind: 'signaling',
    rateMeaning: 'USB4 v1 base rate class per direction.',
    directionality: FD,
    status: 'standard',
    caveat:
      'USB4 dynamically shares bandwidth between USB data, DisplayPort and Thunderbolt tunnels.',
    sourceIds: ['usb4'],
  },
  {
    id: 'usb4-40',
    family: 'USB',
    label: 'USB4 v1 (40 Gbps class)',
    rateGbps: 40,
    displayRate: '40 Gbps',
    rateKind: 'signaling',
    rateMeaning: 'USB4 v1 high rate class per direction.',
    directionality: FD,
    status: 'standard',
    caveat: 'Requires both device and host to support the 40 Gbps class.',
    sourceIds: ['usb4'],
  },
  {
    id: 'usb4v2-80',
    family: 'USB',
    label: 'USB4 v2.0 (80 Gbps)',
    rateGbps: 80,
    displayRate: '80 Gbps',
    rateKind: 'signaling',
    rateMeaning: 'USB4 v2.0 symmetric rate per direction.',
    directionality: FD,
    status: 'published-spec',
    sourceIds: ['usb-80g-announcement', 'usb4-20-spec'],
  },
  {
    id: 'usb4v2-asym',
    family: 'USB',
    label: 'USB4 v2.0 asymmetric',
    rateGbps: 120,
    displayRate: '120 Gbps + 40 Gbps',
    rateKind: 'signaling',
    rateMeaning:
      'Optional PAM4 mode: 120 Gbps in one direction while keeping 40 Gbps in the other.',
    directionality: 'Asymmetric (120 Gbps one way, 40 Gbps back).',
    status: 'published-spec',
    caveat: 'Not 160 Gbps in each direction; the two directions are not equal in this mode.',
    sourceIds: ['usb-80g-announcement'],
  },

  // -- HDMI -----------------------------------------------------------------
  {
    id: 'hdmi14',
    family: 'HDMI',
    label: 'HDMI 1.4',
    rateGbps: 10.2,
    displayRate: '10.2 Gbps',
    rateKind: 'link',
    rateMeaning: 'Total video + audio bandwidth, source to display.',
    directionality: 'One-way (source → display), aggregate.',
    status: 'standard',
    caveat:
      'A display/audio signal path, not a file-transfer interface; it is not comparable to PCIe data throughput.',
    sourceIds: ['hdmi-la-bandwidth'],
  },
  {
    id: 'hdmi20',
    family: 'HDMI',
    label: 'HDMI 2.0',
    rateGbps: 18,
    displayRate: '18 Gbps',
    rateKind: 'link',
    rateMeaning: 'Total video + audio bandwidth, source to display.',
    directionality: 'One-way (source → display), aggregate.',
    status: 'standard',
    sourceIds: ['hdmi-la-bandwidth'],
  },
  {
    id: 'hdmi21',
    family: 'HDMI',
    label: 'HDMI 2.1',
    rateGbps: 48,
    displayRate: '48 Gbps',
    rateKind: 'link',
    rateMeaning: 'Total video + audio bandwidth, source to display.',
    directionality: 'One-way (source → display), aggregate.',
    status: 'standard',
    caveat:
      'Resolution, refresh, chroma and color depth depend on the full source/display/cable combination.',
    sourceIds: ['hdmi-la-bandwidth'],
  },
  {
    id: 'hdmi22',
    family: 'HDMI',
    label: 'HDMI 2.2 (Ultra96)',
    rateGbps: 96,
    displayRate: '96 Gbps',
    rateKind: 'link',
    rateMeaning: 'Total video + audio bandwidth, source to display.',
    directionality: 'One-way (source → display), aggregate.',
    status: 'standard',
    sourceIds: ['hdmi-22-announce', 'hdmi-la-bandwidth'],
  },

  // -- Ethernet ---------------------------------------------------------------
  {
    id: 'eth10',
    family: 'Ethernet',
    label: '10BASE-T',
    rateGbps: 0.01,
    displayRate: '10 Mbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate.',
    directionality: 'Full duplex on switched links (legacy hubs could be half duplex).',
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth100',
    family: 'Ethernet',
    label: '100BASE-TX',
    rateGbps: 0.1,
    displayRate: '100 Mbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate.',
    directionality: 'Full duplex on switched links (legacy hubs could be half duplex).',
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth1g',
    family: 'Ethernet',
    label: '1GbE (1000BASE-T)',
    rateGbps: 1,
    displayRate: '1 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    caveat:
      'Nominal link rate ≠ application goodput: TCP/IP overhead and congestion reduce real throughput.',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth25',
    family: 'Ethernet',
    label: '2.5GbE (2.5GBASE-T)',
    rateGbps: 2.5,
    displayRate: '2.5 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth5',
    family: 'Ethernet',
    label: '5GbE (5GBASE-T)',
    rateGbps: 5,
    displayRate: '5 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth10g',
    family: 'Ethernet',
    label: '10GbE (10GBASE-T)',
    rateGbps: 10,
    displayRate: '10 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    caveat:
      'Speed label does not identify media: twisted pair, fiber, backplane and DAC variants all exist.',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth25g',
    family: 'Ethernet',
    label: '25GbE',
    rateGbps: 25,
    displayRate: '25 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth40',
    family: 'Ethernet',
    label: '40GbE',
    rateGbps: 40,
    displayRate: '40 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth50',
    family: 'Ethernet',
    label: '50GbE',
    rateGbps: 50,
    displayRate: '50 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth100g',
    family: 'Ethernet',
    label: '100GbE',
    rateGbps: 100,
    displayRate: '100 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    caveat: 'Commonly over fiber or multi-lane backplane/DAC; not a single cat-6 cable story.',
    sourceIds: ['ieee-802.3-2022'],
  },
  {
    id: 'eth200',
    family: 'Ethernet',
    label: '200GbE',
    rateGbps: 200,
    displayRate: '200 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3df'],
  },
  {
    id: 'eth400',
    family: 'Ethernet',
    label: '400GbE',
    rateGbps: 400,
    displayRate: '400 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction.',
    directionality: FD,
    status: 'standard',
    sourceIds: ['ieee-802.3df'],
  },
  {
    id: 'eth800',
    family: 'Ethernet',
    label: '800GbE',
    rateGbps: 800,
    displayRate: '800 Gbps',
    rateKind: 'link',
    rateMeaning: 'Nominal link rate per direction (IEEE 802.3df-2024).',
    directionality: FD,
    status: 'standard',
    caveat: 'A ratified standard capability: datacenter-class, not common in consumer PCs.',
    sourceIds: ['ieee-802.3df'],
  },

  // -- Wi-Fi ------------------------------------------------------------------
  {
    id: 'wifi5',
    family: 'Wi-Fi',
    label: 'Wi-Fi 5 (802.11ac)',
    rateGbps: 6.93,
    displayRate: '≈ 6.9 Gbps',
    rateKind: 'PHY',
    rateMeaning: 'Theoretical max PHY rate: 8 spatial streams, 160 MHz, 256-QAM.',
    directionality: 'Shared wireless medium, divided among all clients in the cell.',
    status: 'standard',
    caveat: 'A PHY ceiling, not a guaranteed per-client file-transfer speed.',
    sourceIds: ['ieee-802.11ac'],
  },
  {
    id: 'wifi5-2x2',
    family: 'Wi-Fi',
    label: 'Wi-Fi 5, 2×2 client',
    rateGbps: 1.73,
    displayRate: '≈ 1.7 Gbps',
    rateKind: 'PHY',
    rateMeaning: 'Theoretical PHY rate for a 2×2 client: 2 streams, 160 MHz, 256-QAM.',
    directionality: 'Per client, shared medium.',
    status: 'standard',
    caveat: 'Still a PHY ceiling: real throughput is lower after overhead and airtime sharing.',
    sourceIds: ['ieee-802.11ac'],
  },
  {
    id: 'wifi6',
    family: 'Wi-Fi',
    label: 'Wi-Fi 6/6E (802.11ax)',
    rateGbps: 9.6,
    displayRate: '≈ 9.6 Gbps',
    rateKind: 'PHY',
    rateMeaning: 'Theoretical max PHY rate: 8 spatial streams, 160 MHz, 1024-QAM.',
    directionality: 'Shared wireless medium, divided among all clients in the cell.',
    status: 'standard',
    caveat:
      '6E is the same PHY in the 6 GHz band; the band changes interference, not the PHY ceiling.',
    sourceIds: ['ieee-802.11ax', 'wifi-alliance-6'],
  },
  {
    id: 'wifi6-2x2',
    family: 'Wi-Fi',
    label: 'Wi-Fi 6, 2×2 client',
    rateGbps: 2.4,
    displayRate: '≈ 2.4 Gbps',
    rateKind: 'PHY',
    rateMeaning: 'Theoretical PHY rate for a 2×2 client: 2 streams, 160 MHz, 1024-QAM.',
    directionality: 'Per client, shared medium.',
    status: 'standard',
    sourceIds: ['ieee-802.11ax'],
  },
  {
    id: 'wifi7',
    family: 'Wi-Fi',
    label: 'Wi-Fi 7 (802.11be)',
    rateGbps: 46,
    displayRate: '≈ 46 Gbps',
    rateKind: 'theoretical',
    rateMeaning: 'Theoretical max PHY rate: 16 spatial streams, 320 MHz, 4096-QAM.',
    directionality: 'Shared wireless medium, divided among all clients in the cell.',
    status: 'standard',
    caveat:
      'Requires an extreme 16×16 access point; a normal laptop or phone cannot achieve this aggregate figure.',
    sourceIds: ['ieee-802.11be', 'wifi-alliance-7'],
  },
  {
    id: 'wifi7-2x2',
    family: 'Wi-Fi',
    label: 'Wi-Fi 7, 2×2 client',
    rateGbps: 5.76,
    displayRate: '≈ 5.8 Gbps',
    rateKind: 'PHY',
    rateMeaning: 'Theoretical PHY rate for a 2×2 client: 2 streams, 320 MHz, 4096-QAM.',
    directionality: 'Per client, shared medium.',
    status: 'vendor-example',
    caveat:
      'Client-class example (e.g. Intel Wi-Fi 7 2×2); real throughput depends on conditions and airtime.',
    sourceIds: ['intel-wifi7', 'ieee-802.11be'],
  },
  // --- Main memory (JEDEC DDR), per-channel bandwidth -------------------------
  {
    id: 'ddr1',
    family: 'Memory',
    label: 'DDR1 (PC-3200)',
    rateGbps: 25.6,
    displayRate: '400 MT/s',
    rateKind: 'signaling',
    rateMeaning:
      '400 MT/s per pin, the top JESD79F bin. Per-channel bandwidth on a 64-bit bus: 3.2 GB/s.',
    directionality: 'Shared read/write bus; total per-channel bandwidth, not a one-way figure.',
    status: 'standard',
    sourceIds: ['jedec-jesd79f'],
  },
  {
    id: 'ddr2',
    family: 'Memory',
    label: 'DDR2 (PC2-8500)',
    rateGbps: 68.2,
    displayRate: '1066 MT/s',
    rateKind: 'signaling',
    rateMeaning:
      '1066 MT/s per pin, the top JESD79-2 bin. Per-channel bandwidth on a 64-bit bus: 8.53 GB/s.',
    directionality: 'Shared read/write bus; total per-channel bandwidth, not a one-way figure.',
    status: 'standard',
    sourceIds: ['jedec-jesd79-2'],
  },
  {
    id: 'ddr3',
    family: 'Memory',
    label: 'DDR3 (PC3-17000)',
    rateGbps: 136.5,
    displayRate: '2133 MT/s',
    rateKind: 'signaling',
    rateMeaning:
      '2133 MT/s per pin, the top JESD79-3 bin. Per-channel bandwidth on a 64-bit bus: 17.07 GB/s.',
    directionality: 'Shared read/write bus; total per-channel bandwidth, not a one-way figure.',
    status: 'standard',
    sourceIds: ['jedec-jesd79-3'],
  },
  {
    id: 'ddr4',
    family: 'Memory',
    label: 'DDR4 (PC4-25600)',
    rateGbps: 204.8,
    displayRate: '3200 MT/s',
    rateKind: 'signaling',
    rateMeaning:
      '3200 MT/s per pin, the top JESD79-4 bin. Per-channel bandwidth on a 64-bit bus: 25.6 GB/s.',
    directionality: 'Shared read/write bus; total per-channel bandwidth, not a one-way figure.',
    status: 'standard',
    sourceIds: ['jedec-jesd79-4'],
  },
  {
    id: 'ddr5',
    family: 'Memory',
    label: 'DDR5 (9200 MT/s)',
    rateGbps: 588.8,
    displayRate: '9200 MT/s',
    rateKind: 'signaling',
    rateMeaning:
      '9200 MT/s per pin, the current top JESD79-5 bin. Per-channel bandwidth on a 2x32-bit bus: 73.6 GB/s.',
    directionality: 'Shared read/write bus; total per-channel bandwidth, not a one-way figure.',
    status: 'standard',
    caveat:
      'JEDEC base bins start at 4800 MT/s. A system multiplies the per-channel rate by its channel count (two on most desktops, more in servers).',
    sourceIds: ['jedec-jesd79-5'],
  },
  {
    id: 'ddr6',
    family: 'Memory',
    label: 'DDR6 (preview)',
    rateGbps: 1228.8,
    displayRate: '12,800 MT/s',
    rateKind: 'signaling',
    rateMeaning:
      "12,800 MT/s per pin, the starting rate in JEDEC's November 2026 DDR6 preview. Per-channel bandwidth on a 96-bit bus: ≈ 153.6 GB/s.",
    directionality: 'Shared read/write bus; total per-channel bandwidth, not a one-way figure.',
    status: 'future',
    caveat:
      'Standard in development: the JEDEC preview extends the roadmap to 14,400 MT/s and beyond, with commercialization expected in 2028-2029. Final details may change.',
    sourceIds: ['jedec-ddr6-preview'],
  },

  // --- HBM (JEDEC), per-stack bandwidth ----------------------------------------
  {
    id: 'hbm1',
    family: 'Memory',
    label: 'HBM1',
    rateGbps: 1024,
    displayRate: '128 GB/s per stack',
    rateKind: 'link',
    rateMeaning:
      'Per-stack bandwidth of a 1024-bit interface (8x128-bit channels) at 1000 MT/s per pin, JESD235 (2013).',
    directionality: 'Aggregate per-stack bandwidth; each channel is bidirectional.',
    status: 'standard',
    sourceIds: ['jedec-jesd235'],
  },
  {
    id: 'hbm2',
    family: 'Memory',
    label: 'HBM2',
    rateGbps: 2048,
    displayRate: '256 GB/s per stack',
    rateKind: 'link',
    rateMeaning:
      'Per-stack bandwidth of a 1024-bit interface at 2000 MT/s per pin, JESD235a (2016).',
    directionality: 'Aggregate per-stack bandwidth; each channel is bidirectional.',
    status: 'standard',
    sourceIds: ['jedec-jesd235a'],
  },
  {
    id: 'hbm2e',
    family: 'Memory',
    label: 'HBM2E',
    rateGbps: 2456,
    displayRate: '307 GB/s per stack',
    rateKind: 'link',
    rateMeaning:
      'JEDEC December 2018 HBM update, 2400 MT/s per pin on a 1024-bit interface. Vendor products later ran up to 3600 MT/s (461 GB/s).',
    directionality: 'Aggregate per-stack bandwidth; each channel is bidirectional.',
    status: 'standard',
    sourceIds: ['jedec-hbm2e-update'],
  },
  {
    id: 'hbm3',
    family: 'Memory',
    label: 'HBM3',
    rateGbps: 6553.6,
    displayRate: '819 GB/s per stack',
    rateKind: 'link',
    rateMeaning:
      'Per-stack bandwidth of a 1024-bit interface (16x64-bit channels) at 6400 MT/s per pin, JESD270-3 (2022).',
    directionality: 'Aggregate per-stack bandwidth; each channel is bidirectional.',
    status: 'standard',
    sourceIds: ['jedec-hbm3'],
  },
  {
    id: 'hbm3e',
    family: 'Memory',
    label: 'HBM3E',
    rateGbps: 9830.4,
    displayRate: '1229 GB/s per stack',
    rateKind: 'link',
    rateMeaning:
      'HBM3-family update at 9600 MT/s per pin on a 1024-bit interface (2023); products reach 9800 MT/s (1229 GB/s).',
    directionality: 'Aggregate per-stack bandwidth; each channel is bidirectional.',
    status: 'standard',
    sourceIds: ['jedec-hbm3'],
  },
  {
    id: 'hbm4',
    family: 'Memory',
    label: 'HBM4',
    rateGbps: 16384,
    displayRate: '2048 GB/s per stack',
    rateKind: 'link',
    rateMeaning:
      'Per-stack bandwidth of a 2048-bit interface at 8000 MT/s per pin, JESD270-4 (April 2025). Backward compatible with HBM3 controllers.',
    directionality: 'Aggregate per-stack bandwidth; each channel is bidirectional.',
    status: 'standard',
    sourceIds: ['jedec-hbm4'],
  },
];

/** Roadmap items, kept out of the ratified comparison chart. */
export interface RoadmapItem {
  id: string;
  family: InterfaceFamily;
  label: string;
  displayRate: string;
  note: string;
  sourceIds: string[];
}

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'eth1600',
    family: 'Ethernet',
    label: '1.6 Tb/s Ethernet (1.6 TbE)',
    displayRate: '1.6 Tbps',
    note: 'IEEE 802.3dj work in progress. Not a ratified or deployed standard; shown for scale only.',
    sourceIds: ['ea-roadmap'],
  },
  {
    id: 'wifi8',
    family: 'Wi-Fi',
    label: 'Wi-Fi 8 (802.11bn)',
    displayRate: 'no ratified PHY rate',
    note: 'IEEE draft (PAR approved 2023-09-21), not released. Its goal is Ultra High Reliability: at least +25% throughput, -25% latency and -25% packet loss versus Wi-Fi 7 in dense conditions, not a higher peak PHY rate.',
    sourceIds: ['ieee-802.11bn'],
  },
];

/**
 * Data-verified date for the reference values on this page.
 */
export const DATA_CHECKED = '24 November 2026';
