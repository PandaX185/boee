export type SemVer = [number, number, number];

export function parseVersionTag(tag: string): SemVer | null {
  const cleaned = tag
    .trim()
    .toLowerCase()
    .replace(/^boee-/, '')
    .replace(/^v/, '');
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(left: SemVer, right: SemVer): number {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

export function isNewerVersion(latest: string, current: string): boolean {
  const latestVersion = parseVersionTag(latest);
  const currentVersion = parseVersionTag(current);
  if (!latestVersion || !currentVersion) {
    return false;
  }
  return compareVersions(latestVersion, currentVersion) > 0;
}
