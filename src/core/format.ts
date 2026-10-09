const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const decimals = exponent === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(decimals)} ${BYTE_UNITS[exponent]}`;
}

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function formatQps(value: number): string {
  if (!Number.isFinite(value)) {
    return '0 QPS';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K QPS`;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} QPS`;
}

export function formatPercent(fraction: number): string {
  const percent = fraction * 100;
  return `${percent.toFixed(percent >= 10 ? 0 : 1)}%`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0s';
  }
  if (seconds >= 86400) {
    return `${(seconds / 86400).toFixed(1)} days`;
  }
  if (seconds >= 3600) {
    return `${(seconds / 3600).toFixed(1)} hours`;
  }
  if (seconds >= 60) {
    return `${(seconds / 60).toFixed(1)} minutes`;
  }
  return `${seconds.toFixed(0)}s`;
}
