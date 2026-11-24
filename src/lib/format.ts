/**
 * Display formatting. Rounding is deliberate and conservative:
 * the site must not imply false precision.
 *  - ≥ 1,000 → integer with thousands separators (1,024)
 *  - ≥ 100   → 1 decimal (252.1)
 *  - ≥ 10    → 2 decimals (31.51)
 *  - ≥ 1     → 3 decimals (0.985, 7.877)
 *  - < 1     → 3 decimals, trailing zeros trimmed (0.25)
 */

export function formatRate(value: number): string {
  const abs = Math.abs(value);
  if (!Number.isFinite(value)) return 'n/a';
  let out: string;
  if (abs >= 1000) {
    out = Math.round(value).toLocaleString('en-US');
  } else if (abs >= 100) {
    out = value.toFixed(1).replace(/\.0$/, '');
  } else if (abs >= 10) {
    out = value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  } else if (abs >= 1) {
    out = value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  } else {
    out = value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }
  return out;
}

/** e.g. `31.51 GB/s`, `8 Gbps`, `128 GT/s`. Units are never omitted. */
export function withUnit(value: number, unit: string): string {
  return `${formatRate(value)} ${unit}`;
}
