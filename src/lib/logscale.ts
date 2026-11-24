/**
 * Logarithmic scale for the comparison chart.
 * Rates span 10 Mbps (0.01 Gbps) to PCIe 7.0 ×16 one-way (2048 Gbps),
 * so a linear axis would render everything except the top two bars.
 */

export const CHART_MIN_GBPS = 0.01; // 10 Mbps
export const CHART_MAX_GBPS = 20000; // just past the 16384 Gbps HBM4 top bar

export function logPosition(gbps: number, min = CHART_MIN_GBPS, max = CHART_MAX_GBPS): number {
  const clamped = Math.min(Math.max(gbps, min), max);
  return (Math.log10(clamped) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
}

/** Decade gridline positions + labels. */
export const CHART_TICKS: Array<{ value: number; label: string }> = [
  { value: 0.01, label: '10 Mbps' },
  { value: 0.1, label: '100 Mbps' },
  { value: 1, label: '1 Gbps' },
  { value: 10, label: '10 Gbps' },
  { value: 100, label: '100 Gbps' },
  { value: 1000, label: '1 Tbps' },
  { value: 10000, label: '10 Tbps' },
];
