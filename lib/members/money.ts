/**
 * Formats an integer satang amount (THB * 100) as Thai baht. Dependency-free so both Server and
 * Client Components can import it. Whole-baht amounts render without decimals; fractional amounts
 * (e.g. a 20% deposit that isn't round) show up to two.
 */
export function formatSatang(satang: number, withUnit = true): string {
  const baht = satang / 100;
  const n = baht.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(baht) ? 0 : 2,
  });
  return withUnit ? `${n} บาท` : n;
}
