/**
 * Currency, number, and epoch formatters for the HUD and scenes
 */

export function formatNumber(num: number, decimals: number = 0): string {
  return Math.floor(num).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatEpoch(epoch: number): string {
  return `EPOCH ${epoch.toString().padStart(3, "0")}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatRate(rate: number): string {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${rate.toFixed(1)}/s`;
}

export function formatPips(branches: number, max: number = 10): string {
  const filled = "▮".repeat(Math.max(0, Math.min(branches, max)));
  const empty = "▯".repeat(Math.max(0, max - branches));
  return `${filled}${empty}   ${branches}/${max}`;
}
