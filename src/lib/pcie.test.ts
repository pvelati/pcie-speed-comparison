import { describe, expect, it } from 'vitest';
import { LANE_WIDTHS, PCIE_GENERATIONS } from '../data/standards.js';
import {
  formatDuration,
  linkMetrics,
  oneWayRatio,
  perLanePerDirectionGBps,
  transferSeconds,
} from '../lib/pcie.js';

const gen = (n: number) => PCIE_GENERATIONS.find((g) => g.generation === n)!;

describe('perLanePerDirectionGBps', () => {
  it('Gen 1 (2.5 GT/s, 8b/10b) = 0.25 GB/s per lane per direction', () => {
    expect(perLanePerDirectionGBps(gen(1))).toBeCloseTo(0.25, 12);
  });

  it('Gen 2 (5.0 GT/s, 8b/10b) = 0.5 GB/s', () => {
    expect(perLanePerDirectionGBps(gen(2))).toBeCloseTo(0.5, 12);
  });

  it('Gen 3 (8.0 GT/s, 128b/130b) ≈ 0.984615 GB/s', () => {
    expect(perLanePerDirectionGBps(gen(3))).toBeCloseTo((8 * (128 / 130)) / 8, 12);
    expect(perLanePerDirectionGBps(gen(3))).toBeCloseTo(0.9846153846, 6);
  });

  it('Gen 4 (16.0 GT/s, 128b/130b) ≈ 1.969231 GB/s', () => {
    expect(perLanePerDirectionGBps(gen(4))).toBeCloseTo((16 * (128 / 130)) / 8, 12);
  });

  it('Gen 5 (32.0 GT/s, 128b/130b) ≈ 3.938462 GB/s', () => {
    expect(perLanePerDirectionGBps(gen(5))).toBeCloseTo((32 * (128 / 130)) / 8, 12);
  });

  it('Gen 6 uses PCI-SIG headline (256 GB/s x16 bidirectional) → 8 GB/s per lane', () => {
    expect(perLanePerDirectionGBps(gen(6))).toBeCloseTo(256 / 2 / 16, 12);
    expect(perLanePerDirectionGBps(gen(6))).toBe(8);
  });

  it('Gen 7 uses PCI-SIG headline (512 GB/s x16 bidirectional) → 16 GB/s per lane', () => {
    expect(perLanePerDirectionGBps(gen(7))).toBeCloseTo(512 / 2 / 16, 12);
    expect(perLanePerDirectionGBps(gen(7))).toBe(16);
  });

  it('does not apply NRZ encoding formulas to PAM4 generations', () => {
    // A naive 128b/130b formula would give 64 × (128/130) / 8 = 7.877 for Gen 6.
    expect(perLanePerDirectionGBps(gen(6))).not.toBeCloseTo((64 * (128 / 130)) / 8, 1);
  });
});

describe('linkMetrics — known configurations', () => {
  it('Gen 1 x1: 0.25 GB/s one-way, 0.5 GB/s bidirectional, 2 Gbps one-way', () => {
    const m = linkMetrics(gen(1), 1);
    expect(m.oneWayGBps).toBeCloseTo(0.25, 12);
    expect(m.bidirectionalGBps).toBeCloseTo(0.5, 12);
    expect(m.oneWayGbps).toBeCloseTo(2, 12);
  });

  it('Gen 3 x1: ≈ 0.985 GB/s one-way', () => {
    const m = linkMetrics(gen(3), 1);
    expect(m.oneWayGBps).toBeCloseTo(0.9846153846, 6);
  });

  it('Gen 4 x4 (NVMe): ≈ 7.877 GB/s one-way (≈ 63 Gbps)', () => {
    const m = linkMetrics(gen(4), 4);
    expect(m.oneWayGBps).toBeCloseTo(((16 * (128 / 130)) / 8) * 4, 12);
    expect(m.oneWayGBps).toBeCloseTo(7.8769230769, 6);
    expect(m.oneWayGbps).toBeCloseTo(63.0153846153, 6);
  });

  it('Gen 5 x16: ≈ 63.015 GB/s one-way, 126.03 GB/s bidirectional', () => {
    const m = linkMetrics(gen(5), 16);
    expect(m.oneWayGBps).toBeCloseTo(63.0153846153, 6);
    expect(m.bidirectionalGBps).toBeCloseTo(126.0307692307, 6);
  });

  it('Gen 6 x16: exactly 128 GB/s one-way, 256 GB/s bidirectional', () => {
    const m = linkMetrics(gen(6), 16);
    expect(m.oneWayGBps).toBe(128);
    expect(m.bidirectionalGBps).toBe(256);
    expect(m.oneWayGbps).toBe(1024);
  });

  it('Gen 7 x16: exactly 256 GB/s one-way, 512 GB/s bidirectional', () => {
    const m = linkMetrics(gen(7), 16);
    expect(m.oneWayGBps).toBe(256);
    expect(m.bidirectionalGBps).toBe(512);
    expect(m.oneWayGbps).toBe(2048);
  });

  it('one-way is exactly half of bidirectional aggregate (no rounding involved)', () => {
    for (const g of PCIE_GENERATIONS) {
      for (const lanes of LANE_WIDTHS) {
        const m = linkMetrics(g, lanes);
        expect(m.bidirectionalGBps / 2).toBe(m.oneWayGBps);
        expect(m.bidirectionalGbps / 2).toBe(m.oneWayGbps);
      }
    }
  });

  it('Gbps is exactly 8× GB/s', () => {
    for (const g of PCIE_GENERATIONS) {
      for (const lanes of LANE_WIDTHS) {
        const m = linkMetrics(g, lanes);
        expect(m.oneWayGbps / 8).toBe(m.oneWayGBps);
      }
    }
  });

  it('lane scaling is linear across every supported width (x1…x32)', () => {
    for (const g of PCIE_GENERATIONS) {
      const perLane = perLanePerDirectionGBps(g);
      for (const lanes of LANE_WIDTHS) {
        expect(linkMetrics(g, lanes).oneWayGBps).toBeCloseTo(perLane * lanes, 12);
      }
    }
  });
});

describe('oneWayRatio', () => {
  it('Gen 5 x16 vs Gen 3 x16 = 4×', () => {
    expect(oneWayRatio(linkMetrics(gen(5), 16), linkMetrics(gen(3), 16))).toBeCloseTo(4, 12);
  });

  it('identical configs = 1', () => {
    expect(oneWayRatio(linkMetrics(gen(4), 4), linkMetrics(gen(4), 4))).toBe(1);
  });
});

describe('transferSeconds (decimal sizes)', () => {
  it('1 GB at 1 GB/s = 1 s', () => {
    expect(transferSeconds(1_000_000_000, 1)).toBe(1);
  });

  it('10 GB at Gen 5 x16 (63.015… GB/s) ≈ 0.1587 s', () => {
    const secs = transferSeconds(10_000_000_000, linkMetrics(gen(5), 16).oneWayGBps);
    expect(secs).toBeCloseTo(10 / 63.0153846153, 9);
  });

  it('100 GB at Gen 4 x4 (7.877 GB/s) ≈ 12.695 s', () => {
    const secs = transferSeconds(100_000_000_000, linkMetrics(gen(4), 4).oneWayGBps);
    expect(secs).toBeCloseTo(100 / 7.8769230769, 9);
  });

  it('guards against non-positive inputs', () => {
    expect(transferSeconds(0, 10)).toBe(Infinity);
    expect(transferSeconds(1_000_000_000, 0)).toBe(Infinity);
  });
});

describe('formatDuration', () => {
  it('seconds under a minute', () => {
    expect(formatDuration(1.2)).toBe('1.2 s');
  });

  it('minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2 min 5 s');
  });

  it('hours', () => {
    expect(formatDuration(3725)).toBe('1 h 2 min');
  });

  it('infinite → em dash', () => {
    expect(formatDuration(Infinity)).toBe('—');
  });
});
