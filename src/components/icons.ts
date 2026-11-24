/** Inline SVG icons for the interface families. Stroke follows currentColor. */
export type IconName = 'pcie' | 'usb' | 'hdmi' | 'ethernet' | 'wifi' | 'memory';

/** Map data families (chart/compare names + sources-group names) to icons. */
export const FAMILY_ICON: Record<string, IconName> = {
  PCIe: 'pcie',
  'PCI Express': 'pcie',
  USB: 'usb',
  HDMI: 'hdmi',
  Ethernet: 'ethernet',
  'Wi-Fi': 'wifi',
  Memory: 'memory',
};

const PATHS: Record<IconName, string[]> = {
  pcie: [
    'M4 6h11m0 0-2.5-2.5M15 6l-2.5 2.5',
    'M4 12h11m0 0-2.5-2.5M15 12l-2.5 2.5',
    'M4 18h11m0 0-2.5-2.5M15 18l-2.5 2.5',
  ],
  usb: [
    'M12 6.5V17',
    'M12 17l-5.5-4.5',
    'M12 15l5.5-4',
    'M10.5 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0',
    'M6.5 12.5 5 11h2l1.5 1.5',
    'M16 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
    'M12 17v3',
  ],
  hdmi: ['M3 9h18v4.5L19 16H5L3 13.5V9Z', 'M7 12h.01M11 12h.01M15 12h.01'],
  ethernet: ['M5 4h14v11h-3.5v-2.5h-2V15h-2v-2.5h-2V15H5V4Z', 'M8 7h.01M12 7h.01M16 7h.01'],
  wifi: [
    'M4 9.5a12.5 12.5 0 0 1 16 0',
    'M7 13a8 8 0 0 1 10 0',
    'M10.6 18a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0',
  ],
  memory: [
    'M4 7h16v9H4V7Z',
    'M7 16v2.5M10 16v2.5M13 16v2.5M16 16v2.5M19 16v2.5',
    'M7.5 10h3M13.5 10h3',
  ],
};

function svgEl(tag: 'svg' | 'path', attrs: Record<string, string>): SVGElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

export function familyIcon(name: IconName, size = 18): SVGSVGElement {
  const svg = svgEl('svg', {
    class: `icon icon-${name}`,
    width: String(size),
    height: String(size),
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  }) as SVGSVGElement;
  for (const d of PATHS[name]) {
    svg.append(
      svgEl('path', {
        d,
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    );
  }
  return svg;
}
