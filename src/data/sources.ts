/**
 * Authoritative source registry.
 *
 * Every numeric claim in the site must cite at least one id from this list.
 * Only standards bodies, specification documents and first-party technical
 * pages are used as primary evidence: no search-result pages, blogs or
 * AI-generated summaries.
 */
export interface Source {
  id: string;
  name: string;
  url: string;
  /** What this source supports, for the methodology section. */
  supports: string;
}

export const SOURCES: Source[] = [
  {
    id: 'pcisig-70-rate',
    name: 'PCI-SIG: What data rate does the PCIe 7.0 specification define?',
    url: 'https://pcisig.com/what-data-rate-pcie-70-specification',
    supports: 'PCIe 7.0 / 128.0 GT/s headline rate and x16 bandwidth figures.',
  },
  {
    id: 'pcisig-70-features',
    name: 'PCI-SIG: What are the key features of the PCIe 7.0 specification?',
    url: 'https://pcisig.com/what-are-key-features-pcie-70-specification',
    supports: 'PCIe 7.0 features: PAM4 signaling, FLIT-based encoding.',
  },
  {
    id: 'pcisig-60',
    name: 'PCI-SIG: PCI Express 6.0 specification',
    url: 'https://pcisig.com/pci-express-6.0-specification',
    supports: 'PCIe 6.0 / 64.0 GT/s headline and x16 bidirectional bandwidth.',
  },
  {
    id: 'pcisig-60-pam4',
    name: 'PCI-SIG: PCIe 6.0 PAM4, FLIT mode and FEC/CRC FAQ',
    url: 'https://pcisig.com/faq?field_category_value%5B%5D=pci_express_6.0&keys=PAM4',
    supports: 'PCIe 6.0 PAM4 signaling, mandatory FLIT mode, FEC and CRC.',
  },
  {
    id: 'pcisig-base-revs',
    name: 'PCI-SIG: PCI Express Base Specification: approved revisions',
    url: 'https://pcisig.com/specification-overview/pci-express-base',
    supports: 'Current base-specification revision status (e.g. Revision 7.1).',
  },
  {
    id: 'pcisig-cabling-webinar',
    name: 'PCI-SIG: Cabling webinar (PCIe generations, GT/s, encoding, signaling)',
    url: 'https://pcisig.com/sites/default/files/2026-01/PCI-SIG%20Cabling%20Webinar_FINAL.pdf',
    supports: 'PCIe 1.x–5.0 raw rates, 8b/10b and 128b/130b encoding, NRZ signaling.',
  },
  {
    id: 'usb-32',
    name: 'USB-IF: USB 3.2 overview (5 / 10 / 20 Gbps classes)',
    url: 'https://www.usb.org/usb-32-0',
    supports: 'USB 3.2 Gen 1 (5 Gbps), Gen 2 (10 Gbps) and Gen 2x2 (20 Gbps) rates.',
  },
  {
    id: 'usb4',
    name: 'USB-IF: USB4 overview',
    url: 'https://usb.org/usb4',
    supports: 'USB4 20/40 Gbps classes and dynamic bandwidth sharing between protocols.',
  },
  {
    id: 'usb-80g-announcement',
    name: 'USB-IF: USB4 80 Gbps announcement (incl. 120+40 Gbps asymmetric mode)',
    url: 'https://www.usb.org/sites/default/files/2022-10/USB-IF%20USB%2080Gbps%20Announcement_FINAL_v2.pdf',
    supports: 'USB4 v2.0 80 Gbps symmetric and 120/40 Gbps asymmetric PAM4 mode.',
  },
  {
    id: 'usb4-20-spec',
    name: 'USB-IF: USB4 2.0 Specification document page',
    url: 'https://www.usb.org/document-library/usb4r-specification-v20',
    supports: 'USB4 v2.0 specification status and capabilities.',
  },
  {
    id: 'usb-20-spec',
    name: 'USB-IF: USB 2.0 Specification (document library)',
    url: 'https://www.usb.org/document-library/usb-20-specification',
    supports: 'USB 2.0 Hi-Speed 480 Mbit/s rate.',
  },
  {
    id: 'hdmi-22-announce',
    name: 'HDMI Forum: Version 2.2 of the HDMI specification (96 Gbps)',
    url: 'https://hdmiforum.org/hdmi-forum-releases-version-2-2-of-the-hdmi-specification/',
    supports: 'HDMI 2.2 "Ultra96" 96 Gbps total bandwidth.',
  },
  {
    id: 'hdmi-la-bandwidth',
    name: 'HDMI Licensing Administrator: specification bandwidth comparison',
    url: 'https://hdmi.org/download/savefile?fileKey=Marketing%2FHDMI-LA-CES-New-Spec-Press-Conference-20250106_All_Languages.pdf',
    supports: 'HDMI 1.4 / 2.0 / 2.1 / 2.2 bandwidth figures (10.2 / 18 / 48 / 96 Gbps).',
  },
  {
    id: 'ieee-802.3-2022',
    name: 'IEEE: IEEE 802.3-2022 (Ethernet standard) overview',
    url: 'https://standards.ieee.org/ieee/802.3/12400/',
    supports: 'Ethernet rates from 10BASE-T through 100GbE media and nominal rates.',
  },
  {
    id: 'ieee-802.3df',
    name: 'IEEE: IEEE 802.3df-2024 (400 Gb/s and 800 Gb/s Ethernet)',
    url: 'https://standards.ieee.org/ieee/802.3df/11107/',
    supports: '200GbE, 400GbE and 800GbE operation.',
  },
  {
    id: 'ea-roadmap',
    name: 'Ethernet Alliance: Ethernet Roadmap',
    url: 'https://ethernetalliance.org/technology/ethernet-roadmap/',
    supports: 'Emerging 1.6 Tb/s Ethernet roadmap item (not yet ratified).',
  },
  {
    id: 'ieee-802.11ac',
    name: 'IEEE: IEEE 802.11ac standard page',
    url: 'https://standards.ieee.org/ieee/802.11ac/6656/',
    supports: 'Wi-Fi 5 (802.11ac) PHY modes: 160 MHz channels, 256-QAM, spatial streams.',
  },
  {
    id: 'ieee-802.11ax',
    name: 'IEEE: IEEE 802.11ax-2021 (Wi-Fi 6) standard page',
    url: 'https://standards.ieee.org/ieee/802.11ax/7433/',
    supports: 'Wi-Fi 6 (802.11ax) PHY modes: 1024-QAM, 160 MHz channels.',
  },
  {
    id: 'ieee-802.11be',
    name: 'IEEE: IEEE 802.11be-2024 (Wi-Fi 7) standard page',
    url: 'https://standards.ieee.org/ieee/802.11ax/7516/',
    supports: 'Wi-Fi 7 (802.11be) modes: 320 MHz, 4096-QAM, up to 16 spatial streams.',
  },
  {
    id: 'wifi-alliance-6',
    name: 'Wi-Fi Alliance: Wi-Fi CERTIFIED 6/6E (802.11ax)',
    url: 'https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-6',
    supports: 'Wi-Fi 6/6E branding and PHY-rate context.',
  },
  {
    id: 'wifi-alliance-7',
    name: 'Wi-Fi Alliance: Wi-Fi CERTIFIED 7 technology overview',
    url: 'https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7',
    supports: 'Wi-Fi 7 headline PHY rate (up to ~46 Gbps under 16-stream/320 MHz conditions).',
  },
  {
    id: 'intel-wifi7',
    name: 'Intel: Wi-Fi 7 wireless products (2×2 client rates)',
    url: 'https://www.intel.com/content/www/us/en/products/details/wireless/wi-fi-7-series.html',
    supports: 'Wi-Fi 7 2×2 client-class PHY rate example (~5.8 Gbps at 320 MHz).',
  },
  // --- Main memory (JEDEC DDR) ---
  {
    id: 'jedec-jesd79f',
    name: 'JEDEC: JESD79F Double Data Rate (DDR) SDRAM standard',
    url: 'https://www.jedec.org/standards-documents/docs/jesd79f',
    supports: 'DDR1 (JESD79) speed bins, top bin 400 MT/s (PC-3200).',
  },
  {
    id: 'jedec-jesd79-2',
    name: 'JEDEC: JESD79-2 DDR2 SDRAM standard',
    url: 'https://www.jedec.org/standards-documents/docs/jesd79-2',
    supports: 'DDR2 speed bins, top bin 1066 MT/s (PC2-8500).',
  },
  {
    id: 'jedec-jesd79-3',
    name: 'JEDEC: JESD79-3 DDR3 SDRAM standard',
    url: 'https://www.jedec.org/standards-documents/docs/jesd79-3',
    supports: 'DDR3 speed bins, top bin 2133 MT/s (PC3-17000).',
  },
  {
    id: 'jedec-jesd79-4',
    name: 'JEDEC: JESD79-4 DDR4 SDRAM standard',
    url: 'https://www.jedec.org/standards-documents/docs/jesd79-4',
    supports: 'DDR4 speed bins, top bin 3200 MT/s (PC4-25600).',
  },
  {
    id: 'jedec-jesd79-5',
    name: 'JEDEC: JESD79-5 DDR5 SDRAM standard',
    url: 'https://www.jedec.org/standards-documents/docs/jesd79-5',
    supports: 'DDR5 speed bins; the current top bin of 9200 MT/s.',
  },
  {
    id: 'jedec-ddr6-preview',
    name: 'JEDEC: DDR6 DRAM preview (November 2026)',
    url: 'https://www.jedec.org/news/pressreleases/jedec%C2%AE-previews-next-generation-ddr6-dram-higher-performance-greater-capacity',
    supports:
      'DDR6 starting rate 12,800 MT/s on a 96-bit bus, roadmap to 14,400 MT/s and beyond, commercialization expected 2028-2029.',
  },
];

export const SOURCES_BY_ID: ReadonlyMap<string, Source> = new Map(SOURCES.map((s) => [s.id, s]));

export function sourceLink(id: string): Source | undefined {
  return SOURCES_BY_ID.get(id);
}
