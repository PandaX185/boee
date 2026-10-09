import { AccessibilityInfo, Alert, Platform } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { UpdateButton } from '@/components/UpdateButton';
import {
  checkForUpdate,
  openUpdateUrl,
  type LatestRelease,
  type UpdateStatus,
} from '@/services/appUpdate';

jest.mock('@/services/appUpdate', () => ({
  checkForUpdate: jest.fn(),
  openUpdateUrl: jest.fn(),
  releasesPageUrl: jest.fn(() => 'https://github.com/PandaX185/boee/releases/latest'),
}));

jest.unmock('@/components/motion/reducedMotion');

const mockCheck = checkForUpdate as jest.Mock;
const mockOpen = openUpdateUrl as jest.Mock;

const LATEST_RELEASE: LatestRelease = {
  tag: 'boee-v1.2.1',
  name: 'boee-v1.2.1',
  htmlUrl: 'https://github.com/PandaX185/boee/releases/tag/boee-v1.2.1',
  publishedAt: null,
  apkUrl: 'https://example.com/app.apk',
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

type DialogButton = { text: string; onPress?: () => void };

function dialogButtons(): DialogButton[] {
  const calls = (Alert.alert as jest.Mock).mock.calls;
  return calls[calls.length - 1][2] as DialogButton[];
}

function pressDialogButton(text: string) {
  dialogButtons()
    .find((button) => button.text === text)
    ?.onPress?.();
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  mockCheck.mockResolvedValue(CURRENT_STATUS);
});

afterEach(() => {
  jest.restoreAllMocks();
  Platform.OS = 'ios';
});

describe('UpdateButton', () => {
  it('badges silently on launch when an update is available', async () => {
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    await render(<UpdateButton />);
    expect(
      screen.getByRole('button', { name: 'Update available. Check for updates.' }),
    ).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByTestId('update-badge')).toBeOnTheScreen());
  });

  it('alerts when already up to date', async () => {
    await render(<UpdateButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'You’re up to date',
        expect.stringContaining('1.2.1'),
        expect.anything(),
      ),
    );
  });

  it('shows a spinner and ignores repeat presses while checking', async () => {
    let resolveCheck!: (status: UpdateStatus) => void;
    mockCheck.mockImplementationOnce(
      () =>
        new Promise<UpdateStatus>((resolve) => {
          resolveCheck = resolve;
        }),
    );
    await render(<UpdateButton />);
    const button = screen.getByRole('button', { name: 'Check for updates' });
    await fireEvent.press(button);
    await fireEvent.press(button);
    expect(screen.getByTestId('update-checking')).toBeOnTheScreen();
    expect(mockCheck).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveCheck(CURRENT_STATUS);
    });
  });

  it('offers a direct apk download on android', async () => {
    Platform.OS = 'android';
    mockCheck.mockResolvedValue(UPDATE_STATUS);
    await render(<UpdateButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Update available',
        expect.stringContaining('boee-v1.3.0'),
        expect.anything(),
      ),
    );
    pressDialogButton('Download APK');
    await waitFor(() => expect(mockOpen).toHaveBeenCalledWith('https://example.com/app.apk'));
  });

  it('opens the release page when no download url exists', async () => {
    mockCheck.mockResolvedValue({ ...UPDATE_STATUS, downloadUrl: null });
    await render(<UpdateButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    pressDialogButton('View release');
    expect(mockOpen).not.toHaveBeenCalled();
    pressDialogButton('Release notes');
    await waitFor(() =>
      expect(mockOpen).toHaveBeenCalledWith(
        'https://github.com/PandaX185/boee/releases/tag/boee-v1.2.1',
      ),
    );
  });

  it('names an unknown installed version', async () => {
    mockCheck.mockResolvedValue({ ...UPDATE_STATUS, current: null });
    await render(<UpdateButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Update available',
        expect.stringContaining('unknown'),
        expect.anything(),
      ),
    );
  });

  it('matches latest without a known version', async () => {
    mockCheck.mockResolvedValue({ ...CURRENT_STATUS, current: null });
    await render(<UpdateButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'You’re up to date',
        'Installed version matches latest.',
        expect.anything(),
      ),
    );
  });

  it('alerts with retry when the check fails', async () => {
    mockCheck.mockResolvedValue({ ...CURRENT_STATUS, error: 'network', latest: null });
    await render(<UpdateButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Couldn’t check for updates',
        expect.anything(),
        expect.anything(),
      ),
    );
    pressDialogButton('Retry');
    await waitFor(() => expect(mockCheck).toHaveBeenCalledTimes(2));
  });
});
