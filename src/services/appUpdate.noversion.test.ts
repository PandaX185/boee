import { checkForUpdate, getCurrentVersion } from '@/services/appUpdate';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: null, manifest: null },
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

const RELEASE_JSON = {
  tag_name: 'boee-v1.3.0',
  name: '',
  html_url: 'https://github.com/PandaX185/boee/releases/tag/boee-v1.3.0',
  published_at: null,
  assets: [],
};

describe('appUpdate without a bundled version', () => {
  it('reports no current version', () => {
    expect(getCurrentVersion()).toBeNull();
  });

  it('never flags an update without a version to compare', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => RELEASE_JSON,
    })) as never;
    const status = await checkForUpdate(50);
    expect(status.current).toBeNull();
    expect(status.updateAvailable).toBe(false);
    expect(status.latest?.name).toBe('boee-v1.3.0');
    expect(status.error).toBeNull();
  });
});
