/**
 * Pure PCIe bandwidth math. No DOM, no state — unit-testable.
 *
 * Conventions:
 *  - Decimal SI units only: 1 GB = 1,000 MB, 1 GB/s = 8 Gbps.
 *  - "one-way" = one direction of a full-duplex link.
 *  - "bidirectional aggregate" = the sum of both directions. Never
 *    present it as a one-way rate.
 */
import type { PcieGeneration } from '../data/standards.js';

/** Encoded data ceiling per lane, one direction, in GB/s. */
export function perLanePerDirectionGBps(gen: PcieGeneration): number {
  switch (gen.family) {
    case '8b10b':
      // GT/s × (8/10) ÷ 8
      return (gen.rawRateGTs * (8 / 10)) / 8;
    case '128b130b':
      // GT/s × (128/130) ÷ 8
      return (gen.rawRateGTs * (128 / 130)) / 8;
    case 'pam4-flit':
      // Nominal PCI-SIG headline: x16 bidirectional GB/s → one direction → per lane.
      // Do NOT apply the NRZ encoding formulas to PAM4 generations.
      return (gen.x16BidirectionalGBps ?? 0) / 2 / 16;
  }
}

export interface LinkMetrics {
  gen: PcieGeneration;
  lanes: number;
  /** GB/s, one direction, per lane. */
  perLaneGBps: number;
  /** GB/s, one direction, whole link. */
  oneWayGBps: number;
  /** GB/s, sum of both directions. */
  bidirectionalGBps: number;
  /** Gbps, one direction, whole link. */
  oneWayGbps: number;
  /** Gbps, sum of both directions. */
  bidirectionalGbps: number;
}

/** All derived figures for one generation + lane count. */
export function linkMetrics(gen: PcieGeneration, lanes: number): LinkMetrics {
  const perLaneGBps = perLanePerDirectionGBps(gen);
  const oneWayGBps = perLaneGBps * lanes;
  return {
    gen,
    lanes,
    perLaneGBps,
    oneWayGBps,
    bidirectionalGBps: oneWayGBps * 2,
    oneWayGbps: oneWayGBps * 8,
    bidirectionalGbps: oneWayGBps * 2 * 8,
  };
}

/** Ratio A/B for one-way comparison. Returns NaN when B is 0. */
export function oneWayRatio(a: LinkMetrics, b: LinkMetrics): number {
  return a.oneWayGBps / b.oneWayGBps;
}

// ---------------------------------------------------------------------------
// File transfer estimates
// ---------------------------------------------------------------------------

/** Decimal file sizes: 1 GB = 1,000,000,000 bytes (SI, not binary GiB). */
export const DECIMAL_GIGABYTES: Readonly<Record<string, number>> = {
  '1 GB': 1_000_000_000,
  '10 GB': 10_000_000_000,
  '100 GB': 100_000_000_000,
};

/**
 * Idealized lower bound: time = bytes / (rate in bytes per second).
 * Protocol overhead, storage speed, CPU/DRAM, thermals etc. all make
 * real transfers slower — this is a floor, not a benchmark.
 */
export function transferSeconds(bytes: number, rateGBps: number): number {
  if (bytes <= 0 || rateGBps <= 0) return Infinity;
  const bytesPerSecond = rateGBps * 1_000_000_000;
  return bytes / bytesPerSecond;
}

/** Human-readable duration. */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return '—';
  if (totalSeconds < 60) return `${trimNumber(totalSeconds, 1)} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  if (minutes < 60) return `${minutes} min ${trimNumber(seconds, 0)} s`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} h ${mins} min`;
}

function trimNumber(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}
