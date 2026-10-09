import { parseEnv } from '@/config/env';

describe('parseEnv', () => {
  it('defaults to development with no api url', () => {
    expect(parseEnv({})).toMatchObject({ appEnv: 'development' });
    expect(parseEnv({}).apiBaseUrl).toBeUndefined();
  });

  it('accepts preview and production environments', () => {
    expect(parseEnv({ EXPO_PUBLIC_APP_ENV: 'preview' }).appEnv).toBe('preview');
    expect(parseEnv({ EXPO_PUBLIC_APP_ENV: 'production' }).appEnv).toBe('production');
  });

  it('accepts a valid api base url', () => {
    expect(parseEnv({ EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com' }).apiBaseUrl).toBe(
      'https://api.example.com',
    );
  });

  it('throws on an unknown environment', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_APP_ENV: 'staging' })).toThrow(/EXPO_PUBLIC/);
  });

  it('throws on an invalid api base url', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_API_BASE_URL: 'not-a-url' })).toThrow();
  });
});
