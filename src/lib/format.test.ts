import { describe, expect, it } from 'vitest';
import { formatRate, withUnit } from './format.js';
import { CHART_MIN_GBPS, CHART_MAX_GBPS, logPosition } from './logscale.js';

describe('formatRate', () => {
  it('small values: 3 decimals, trailing zeros trimmed', () => {
    expect(formatRate(0.25)).toBe('0.25');
    expect(formatRate(0.5)).toBe('0.5');
    expect(formatRate(0.9846153846)).toBe('0.985');
    expect(formatRate(0.125)).toBe('0.125');
  });

  it('1–10: 3 decimals', () => {
    expect(formatRate(1)).toBe('1');
    expect(formatRate(7.876923)).toBe('7.877');
    expect(formatRate(3.938461)).toBe('3.938');
    expect(formatRate(6.93)).toBe('6.93');
    expect(formatRate(5.76)).toBe('5.76');
  });

  it('10–100: 2 decimals', () => {
    expect(formatRate(10.153846)).toBe('10.15');
    expect(formatRate(15.753846)).toBe('15.75');
    expect(formatRate(31.50769)).toBe('31.51');
    expect(formatRate(63.01538)).toBe('63.02');
    expect(formatRate(12.5)).toBe('12.5');
  });

  it('100–1000: 1 decimal, trimmed', () => {
    expect(formatRate(126.030769)).toBe('126');
    expect(formatRate(252.061538)).toBe('252.1');
    expect(formatRate(504.123)).toBe('504.1');
    expect(formatRate(128)).toBe('128');
    expect(formatRate(812.34)).toBe('812.3');
  });

  it('≥ 1000: integer with thousands separators', () => {
    expect(formatRate(1024)).toBe('1,024');
    expect(formatRate(2048)).toBe('2,048');
    expect(formatRate(12345.6)).toBe('12,346');
  });

  it('non-finite → em dash', () => {
    expect(formatRate(Infinity)).toBe('—');
    expect(formatRate(NaN)).toBe('—');
  });

  it('withUnit appends the unit, never omits it', () => {
    expect(withUnit(31.50769, 'GB/s')).toBe('31.51 GB/s');
    expect(withUnit(16, 'GT/s')).toBe('16 GT/s');
    expect(withUnit(2048, 'Gbps')).toBe('2,048 Gbps');
  });
});

describe('logPosition', () => {
  it('endpoints map to 0 and 1', () => {
    expect(logPosition(CHART_MIN_GBPS)).toBe(0);
    expect(logPosition(CHART_MAX_GBPS)).toBe(1);
  });

  it('is strictly monotonic over the data range', () => {
    const values = [0.01, 0.1, 1, 10, 100, 1000, 2048];
    for (let i = 1; i < values.length; i++) {
      expect(logPosition(values[i])).toBeGreaterThan(logPosition(values[i - 1]));
    }
  });

  it('clamps out-of-range values instead of producing NaN or negatives', () => {
    expect(logPosition(0.001)).toBe(0);
    expect(logPosition(1e9)).toBe(1);
  });
});
