import { Platform } from 'react-native';

import {
  checkForUpdate,
  fetchLatestRelease,
  openUpdateUrl,
  pickApkAsset,
} from '@/services/appUpdate';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.1' }, manifest: null },
}));

const mockOpenUrl = jest.fn(async (_url: string) => undefined);
const mockOpenBrowser = jest.fn(async (_url: string) => ({ type: 'opened' }));

jest.mock('expo-linking', () => ({
  openURL: (url: string) => mockOpenUrl(url),
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (url: string) => mockOpenBrowser(url),
}));

const RELEASE_JSON = {
  tag_name: 'boee-v1.3.0',
  name: 'boee-v1.3.0',
  html_url: 'https://github.com/PandaX185/boee/releases/tag/boee-v1.3.0',
  published_at: '2026-10-09T00:00:00Z',
  assets: [
    { name: 'web-build.zip', browser_download_url: 'https://example.com/web.zip' },
    { name: 'boee-boee-v1.3.0.apk', browser_download_url: 'https://example.com/app.apk' },
  ],
};

function mockFetchJson(payload: unknown, ok = true) {
  global.fetch = jest.fn(async () => ({ ok, json: async () => payload })) as never;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pickApkAsset', () => {
  it('selects the apk download url', () => {
    expect(pickApkAsset(RELEASE_JSON.assets)).toBe('https://example.com/app.apk');
    expect(pickApkAsset([{ name: 'web-build.zip', browser_download_url: 'x' }])).toBeNull();
  });
});

describe('fetchLatestRelease', () => {
  it('parses the latest release', async () => {
    mockFetchJson(RELEASE_JSON);
    const release = await fetchLatestRelease();
    expect(release.tag).toBe('boee-v1.3.0');
    expect(release.apkUrl).toBe('https://example.com/app.apk');
  });

  it('rejects invalid payloads', async () => {
    mockFetchJson({ nope: true });
    await expect(fetchLatestRelease()).rejects.toThrow('invalid');
  });

  it('rejects failed responses', async () => {
    mockFetchJson({}, false);
    await expect(fetchLatestRelease()).rejects.toThrow('network');
  });

  it('reports timeouts for aborted requests', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    global.fetch = jest.fn(async () => {
      throw abortError;
    }) as never;
    await expect(fetchLatestRelease()).rejects.toThrow('timeout');
  });

  it('rejects unparsable bodies', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError('bad json');
      },
    })) as never;
    await expect(fetchLatestRelease()).rejects.toThrow('invalid');
  });

  it('rejects non-object payloads', async () => {
    mockFetchJson(null);
    await expect(fetchLatestRelease()).rejects.toThrow('invalid');
  });

  it('rejects releases without version metadata', async () => {
    mockFetchJson({ ...RELEASE_JSON, tag_name: 42, html_url: null, name: '', published_at: 0 });
    await expect(fetchLatestRelease()).rejects.toThrow('invalid');
  });

  it('handles releases without an asset list', async () => {
    mockFetchJson({ ...RELEASE_JSON, tag_name: 'boee-v1.3.0', assets: 'nope' });
    const release = await fetchLatestRelease();
    expect(release.apkUrl).toBeNull();
  });
});

describe('checkForUpdate', () => {
  it('flags newer releases with the apk download', async () => {
    mockFetchJson(RELEASE_JSON);
    const status = await checkForUpdate(50);
    expect(status.updateAvailable).toBe(true);
    expect(status.downloadUrl).toBe('https://example.com/app.apk');
    expect(status.error).toBeNull();
  });

  it('reports current when versions match', async () => {
    mockFetchJson({ ...RELEASE_JSON, tag_name: 'boee-v1.2.1' });
    const status = await checkForUpdate(50);
    expect(status.updateAvailable).toBe(false);
    expect(status.error).toBeNull();
  });

  it('falls back to the release page without an apk asset', async () => {
    mockFetchJson({ ...RELEASE_JSON, tag_name: 'boee-v1.3.0', assets: [] });
    const status = await checkForUpdate();
    expect(status.updateAvailable).toBe(true);
    expect(status.downloadUrl).toBe(RELEASE_JSON.html_url);
  });

  it('surfaces network failures', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as never;
    const status = await checkForUpdate(50);
    expect(status.updateAvailable).toBe(false);
    expect(status.error).toBe('network');
  });
});

describe('openUpdateUrl', () => {
  it('opens http urls in the browser', async () => {
    await openUpdateUrl('https://github.com/PandaX185/boee/releases/latest');
    expect(mockOpenBrowser).toHaveBeenCalledTimes(1);
  });

  it('falls back to linking when the browser fails', async () => {
    mockOpenBrowser.mockRejectedValueOnce(new Error('no browser'));
    await openUpdateUrl('https://github.com/PandaX185/boee/releases/latest');
    expect(mockOpenUrl).toHaveBeenCalledWith('https://github.com/PandaX185/boee/releases/latest');
  });

  it('opens apk urls directly on android', async () => {
    const previous = Platform.OS;
    Platform.OS = 'android';
    try {
      await openUpdateUrl('https://example.com/app.apk');
    } finally {
      Platform.OS = previous;
    }
    expect(mockOpenUrl).toHaveBeenCalledWith('https://example.com/app.apk');
  });
});
