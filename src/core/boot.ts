export type BootStatus = 'loading' | 'ready' | 'failed';

export function getBootStatus(
  scenarioHydrated: boolean,
  settingsHydrated: boolean,
  timedOut: boolean,
): BootStatus {
  if (scenarioHydrated && settingsHydrated) {
    return 'ready';
  }
  if (timedOut) {
    return 'failed';
  }
  return 'loading';
}
