import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { UpdateButton } from '@/components/UpdateButton';
import {
  canInstallInPlace,
  checkForUpdate,
  getInstallContentUri,
  installUpdateApk,
  openUpdateUrl,
  startUpdateDownload,
  type LatestRelease,
  type UpdateStatus,
} from '@/services/appUpdate';

jest.mock('@/services/appUpdate', () => ({
  checkForUpdate: jest.fn(),
  openUpdateUrl: jest.fn(),
  releasesPageUrl: jest.fn(() => 'https://github.com/PandaX185/boee/releases/latest'),
  canInstallInPlace: jest.fn(() => false),
  startUpdateDownload: jest.fn(),
  getInstallContentUri: jest.fn(),
  installUpdateApk: jest.fn(),
}));

jest.unmock('@/components/motion/reducedMotion');

const mockCheck = checkForUpdate as jest.Mock;
const mockOpen = openUpdateUrl as jest.Mock;
const mockCanInstall = canInstallInPlace as jest.Mock;
const mockStartDownload = startUpdateDownload as jest.Mock;
const mockContentUri = getInstallContentUri as jest.Mock;
const mockInstall = installUpdateApk as jest.Mock;

const LATEST_RELEASE: LatestRelease = {
  tag: 'boee-v1.2.1',
  name: 'boee-v1.2.1',
  htmlUrl: 'https://github.com/PandaX185/boee/releases/tag/boee-v1.2.1',
  publishedAt: null,
  apkUrl: 'https://example.com/app.apk',
  apkSize: 34_000_000,
};

const CURRENT_STATUS: UpdateStatus = {
  current: '1.2.1',
  latest: LATEST_RELEASE,
  updateAvailable: false,
  downloadUrl: 'https://example.com/app.apk',
  error: null,
};

const UPDATE_STATUS: UpdateStatus = {
  ...CURRENT_STATUS,
  latest: {
    ...LATEST_RELEASE,
    tag: 'boee-v1.3.0',
    name: 'boee-v1.3.0',
  },
  updateAvailable: true,
};

const downloadedFile = { uri: 'file:///cache/boee-update.apk' };
const mockTask = { cancel: jest.fn() };

function pendingDownload(written = 17_000_000, total = 34_000_000) {
  let resolveDownload!: (file: unknown) => void;
  mockStartDownload.mockImplementation(
    (
      _url: string,
      onProgress?: (written: number, total: number) => void,
    ): Record<string, unknown> => {
      onProgress?.(written, total);
      return {
        task: mockTask,
        done: new Promise((resolve) => {
          resolveDownload = resolve;
        }),
      };
    },
  );
  return (file: unknown) => resolveDownload(file);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  mockCheck.mockResolvedValue(CURRENT_STATUS);
  mockCanInstall.mockReturnValue(false);
  mockStartDownload.mockReturnValue({
    task: mockTask,
    done: Promise.resolve(downloadedFile),
  });
  mockContentUri.mockResolvedValue('content://com.pandax185.boee/boee-update.apk');
  mockInstall.mockResolvedValue({ resultCode: 0 });
});

afterEach(() => {
  jest.restoreAllMocks();
  Platform.OS = 'ios';
});

describe('UpdateButton', () => {
  it('badges silently on launch when an update is available', async () => {
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    const view = await render(<UpdateButton />);
    expect(
      view.getByRole('button', { name: 'Update available. Check for updates.' }),
    ).toBeOnTheScreen();
    await waitFor(() => expect(view.getByTestId('update-badge')).toBeOnTheScreen());
    expect(mockCheck).toHaveBeenCalled();
  });

  it('shows the up-to-date dialog when pressed', async () => {
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('You’re up to date')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(view.queryByText('You’re up to date')).toBeNull());
  });

  it('retries after a failed check', async () => {
    mockCheck.mockResolvedValue({ ...CURRENT_STATUS, error: 'network', latest: null });
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('Something went wrong')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(mockCheck).toHaveBeenCalledTimes(2));
  });

  it('downloads and installs in place on android', async () => {
    Platform.OS = 'android';
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    mockCanInstall.mockReturnValue(true);
    const resolveDownload = pendingDownload();
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('Update available')).toBeOnTheScreen());
    expect(view.getByText('34.0 MB download.', { exact: false })).toBeOnTheScreen();
    await fireEvent.press(view.getByRole('button', { name: 'Download & install' }));
    await waitFor(() => expect(view.getByText('50%')).toBeOnTheScreen());
    await act(async () => {
      resolveDownload(downloadedFile);
    });
    await waitFor(() => expect(view.getByText('Download complete')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Install update' }));
    await waitFor(() =>
      expect(mockInstall).toHaveBeenCalledWith('content://com.pandax185.boee/boee-update.apk'),
    );
    await waitFor(() => expect(view.queryByText('Download complete')).toBeNull());
  });

  it('shows progress for a slow download', async () => {
    Platform.OS = 'android';
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    mockCanInstall.mockReturnValue(true);
    const resolveDownload = pendingDownload();
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('Update available')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Download & install' }));
    await waitFor(() => expect(view.getByText('Downloading update')).toBeOnTheScreen());
    await act(async () => {
      resolveDownload(downloadedFile);
    });
    await waitFor(() => expect(view.getByText('Download complete')).toBeOnTheScreen());
  });

  it('cancels an in-flight download when the dialog closes', async () => {
    Platform.OS = 'android';
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    mockCanInstall.mockReturnValue(true);
    const resolveDownload = pendingDownload();
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('Update available')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Download & install' }));
    await waitFor(() => expect(view.getByText('Downloading update')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Cancel' }));
    expect(mockTask.cancel).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveDownload(downloadedFile);
    });
    await waitFor(() => expect(view.queryByText('Downloading update')).toBeNull());
  });

  it('recovers from download and install failures', async () => {
    Platform.OS = 'android';
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    mockCanInstall.mockReturnValue(true);
    mockStartDownload.mockImplementation(() => ({
      task: mockTask,
      done: Promise.reject(new Error('offline')),
    }));
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('Update available')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Download & install' }));
    await waitFor(() => expect(view.getByText('Download failed. Try again.')).toBeOnTheScreen());

    mockStartDownload.mockReturnValue({
      task: mockTask,
      done: Promise.resolve(downloadedFile),
    });
    mockInstall.mockRejectedValueOnce(new Error('denied'));
    await fireEvent.press(view.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(view.getByText('Update available')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Download & install' }));
    await waitFor(() => expect(view.getByText('Download complete')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'Install update' }));
    await waitFor(() =>
      expect(view.getByText('Could not open the installer.', { exact: false })).toBeOnTheScreen(),
    );
    await fireEvent.press(view.getByRole('button', { name: 'Try installing again' }));
    await waitFor(() => expect(mockInstall).toHaveBeenCalledTimes(2));
  });

  it('opens the release page when in-place install is unavailable', async () => {
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    const view = await render(<UpdateButton />);
    await fireEvent.press(view.getByTestId('update-header-button'));
    await waitFor(() => expect(view.getByText('Update available')).toBeOnTheScreen());
    await fireEvent.press(view.getByRole('button', { name: 'View release' }));
    await waitFor(() =>
      expect(mockOpen).toHaveBeenCalledWith(
        'https://github.com/PandaX185/boee/releases/tag/boee-v1.2.1',
      ),
    );
  });
});
