/** Build-time entry: exposes the typed data model as plain JSON.
 * Bundled by scripts/generate-data.mjs (esbuild, via Vite's dependency). */
import { DATA_CHECKED, INTERFACE_RATES, PCIE_GENERATIONS } from '../src/data/standards.js';
import { perLanePerDirectionGBps } from '../src/lib/pcie.js';

export const data = {
  name: 'Bandwidth Atlas (PCIe Speed Explorer)',
  url: 'https://pvelati.github.io/pcie-speed-comparison/',
  dataChecked: DATA_CHECKED,
  units: 'decimal SI (1 GB = 1,000,000,000 bytes); Gbps = 8 x GB/s',
  pcie: PCIE_GENERATIONS.map((g) => ({
    generation: g.generation,
    label: g.label,
    gtPerSecond: g.rawRateGTs,
    encoding: g.encoding,
    status: g.status ?? 'standard',
    oneWayGBpsPerLane: perLanePerDirectionGBps(g),
    x16BidirectionalGBps: g.x16BidirectionalGBps,
  })),
  interfaces: INTERFACE_RATES.map((r) => ({
    id: r.id,
    family: r.family,
    label: r.label,
    rateGbps: r.rateGbps,
    displayRate: r.displayRate,
    rateKind: r.rateKind,
    rateMeaning: r.rateMeaning,
    directionality: r.directionality,
    status: r.status,
    ...(r.caveat ? { caveat: r.caveat } : {}),
    sourceIds: r.sourceIds,
  })),
};
