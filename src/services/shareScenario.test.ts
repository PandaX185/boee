import { copyMarkdown, shareMarkdown, slugifyFileBase } from '@/services/shareScenario';

const mockFileInstance = {
  exists: false,
  uri: 'file:///cache/estimate.md',
  delete: jest.fn(),
  create: jest.fn(),
  write: jest.fn(),
};
const mockSetStringAsync = jest.fn(async (value: string) => {
  expect(typeof value).toBe('string');
  return true;
});
const mockIsAvailableAsync = jest.fn(async () => true);
const mockShareAsync = jest.fn(async (_uri: string, _options: unknown) => undefined);

jest.mock('expo-clipboard', () => ({
  setStringAsync: (value: string) => mockSetStringAsync(value),
  getStringAsync: jest.fn(async () => ''),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (uri: string, options: unknown) => mockShareAsync(uri, options),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn(() => mockFileInstance),
  Paths: { cache: { uri: 'file:///cache' } },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockFileInstance.exists = false;
  mockIsAvailableAsync.mockResolvedValue(true);
});

describe('slugifyFileBase', () => {
  it('slugifies names', () => {
    expect(slugifyFileBase('Twitter-like feed')).toBe('twitter-like-feed');
    expect(slugifyFileBase('  --Foo__Bar--  ')).toBe('foo-bar');
  });

  it('falls back to estimate for empty names', () => {
    expect(slugifyFileBase('')).toBe('estimate');
    expect(slugifyFileBase('   ')).toBe('estimate');
  });
});

describe('copyMarkdown', () => {
  it('copies the markdown to the clipboard', async () => {
    await copyMarkdown('# Title');
    expect(mockSetStringAsync).toHaveBeenCalledWith('# Title');
  });
});

describe('shareMarkdown', () => {
  it('returns false when sharing is unavailable', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    await expect(shareMarkdown('# Title', 'estimate.md')).resolves.toBe(false);
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  it('writes a file and shares it', async () => {
    await expect(shareMarkdown('# Title', 'estimate.md')).resolves.toBe(true);
    expect(mockFileInstance.create).toHaveBeenCalledTimes(1);
    expect(mockFileInstance.write).toHaveBeenCalledWith('# Title');
    expect(mockShareAsync).toHaveBeenCalledWith(
      mockFileInstance.uri,
      expect.objectContaining({ mimeType: 'text/markdown' }),
    );
  });

  it('deletes a pre-existing file first', async () => {
    mockFileInstance.exists = true;
    await shareMarkdown('# Title', 'estimate.md');
    expect(mockFileInstance.delete).toHaveBeenCalledTimes(1);
  });
});
