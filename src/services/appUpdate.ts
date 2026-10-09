import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { RELEASES_API_URL, RELEASES_PAGE_URL, UPDATE_CHECK_TIMEOUT_MS } from '@/constants/releases';
import { isNewerVersion } from '@/core/version';

export type UpdateCheckErrorCode = 'network' | 'invalid' | 'timeout';

export class UpdateCheckError extends Error {
  code: UpdateCheckErrorCode;

  constructor(code: UpdateCheckErrorCode) {
    super(`Update check failed: ${code}`);
    this.code = code;
  }
}

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface LatestRelease {
  tag: string;
  name: string;
  htmlUrl: string;
  publishedAt: string | null;
  apkUrl: string | null;
}

export interface UpdateStatus {
  current: string | null;
  latest: LatestRelease | null;
  updateAvailable: boolean;
  downloadUrl: string | null;
  error: UpdateCheckErrorCode | null;
}

export function getCurrentVersion(): string | null {
  const expoConfig = Constants.expoConfig;
  const manifest = Constants.manifest as { version?: string } | null | undefined;
  const version = expoConfig?.version ?? manifest?.version;
  return typeof version === 'string' && version.length > 0 ? version : null;
}

export function pickApkAsset(assets: ReleaseAsset[]): string | null {
  const apk = assets.find(
    (asset) =>
      typeof asset.name === 'string' &&
      asset.name.toLowerCase().endsWith('.apk') &&
      typeof asset.browser_download_url === 'string',
  );
  return apk?.browser_download_url ?? null;
}

export async function fetchLatestRelease(signal?: AbortSignal): Promise<LatestRelease> {
  let response: Response;
  try {
    response = await fetch(RELEASES_API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new UpdateCheckError('timeout');
    }
    throw new UpdateCheckError('network');
  }
  if (!response.ok) {
    throw new UpdateCheckError('network');
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new UpdateCheckError('invalid');
  }
  if (typeof payload !== 'object' || payload === null) {
    throw new UpdateCheckError('invalid');
  }
  const release = payload as {
    tag_name?: unknown;
    name?: unknown;
    html_url?: unknown;
    published_at?: unknown;
    assets?: unknown;
  };
  if (typeof release.tag_name !== 'string' || typeof release.html_url !== 'string') {
    throw new UpdateCheckError('invalid');
  }
  const assets = Array.isArray(release.assets) ? (release.assets as ReleaseAsset[]) : [];
  return {
    tag: release.tag_name,
    name:
      typeof release.name === 'string' && release.name.length > 0 ? release.name : release.tag_name,
    htmlUrl: release.html_url,
    publishedAt: typeof release.published_at === 'string' ? release.published_at : null,
    apkUrl: pickApkAsset(assets),
  };
}

export async function checkForUpdate(timeoutMs = UPDATE_CHECK_TIMEOUT_MS): Promise<UpdateStatus> {
  const current = getCurrentVersion();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const latest = await fetchLatestRelease(controller.signal);
    const updateAvailable = current !== null && isNewerVersion(latest.tag, current);
    return {
      current,
      latest,
      updateAvailable,
      downloadUrl: latest.apkUrl ?? latest.htmlUrl,
      error: null,
    };
  } catch (error) {
    const code = error instanceof UpdateCheckError ? error.code : 'network';
    return { current, latest: null, updateAvailable: false, downloadUrl: null, error: code };
  } finally {
    clearTimeout(timer);
  }
}

export async function openUpdateUrl(url: string): Promise<void> {
  if (Platform.OS === 'android' && url.toLowerCase().endsWith('.apk')) {
    await Linking.openURL(url);
    return;
  }
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}

export function releasesPageUrl(): string {
  return RELEASES_PAGE_URL;
}
