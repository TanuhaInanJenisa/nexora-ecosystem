/**
 * Compares two semantic version strings (e.g. "1.2.3").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => v.split('.').map((n) => parseInt(n, 10) || 0);
  const p1 = parse(v1);
  const p2 = parse(v2);
  const len = Math.max(p1.length, p2.length);

  for (let i = 0; i < len; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export interface VersionCheckResult {
  needsUpdate: boolean;
  isForceUpdate: boolean;
  latestVersion: string;
}

export function checkVersionPolicy(
  currentVersion: string,
  policy: {
    latest_version: string;
    minimum_supported_version: string;
    force_update: boolean;
  }
): VersionCheckResult {
  const isBelowMinimum = compareSemver(currentVersion, policy.minimum_supported_version) < 0;
  const isBelowLatest = compareSemver(currentVersion, policy.latest_version) < 0;

  return {
    needsUpdate: isBelowLatest,
    isForceUpdate: policy.force_update || isBelowMinimum,
    latestVersion: policy.latest_version,
  };
}

