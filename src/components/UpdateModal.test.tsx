import { fireEvent, render, screen } from '@testing-library/react-native';

import { UpdateModal, type UpdatePhase } from '@/components/UpdateModal';
import type { LatestRelease } from '@/services/appUpdate';

const LATEST: LatestRelease = {
  tag: 'boee-v1.3.0',
  name: 'boee-v1.3.0',
  htmlUrl: 'https://github.com/PandaX185/boee/releases/tag/boee-v1.3.0',
  publishedAt: null,
  apkUrl: 'https://example.com/app.apk',
  apkSize: 34_000_000,
};

async function renderPhase(phase: UpdatePhase) {
  const onAction = jest.fn();
  await render(<UpdateModal visible phase={phase} onAction={onAction} />);
  return onAction;
}

describe('UpdateModal', () => {
  it('shows a spinner while checking', async () => {
    const onAction = await renderPhase({ kind: 'checking' });
    expect(screen.getByText('Checking for updates…')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onAction).toHaveBeenCalledWith('close');
  });

  it('shows the installed version when up to date', async () => {
    const onAction = await renderPhase({ kind: 'current', version: '1.2.1' });
    expect(screen.getByText('You’re up to date')).toBeOnTheScreen();
    expect(screen.getByText('Installed v1.2.1 is the latest.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'View releases' }));
    expect(onAction).toHaveBeenCalledWith('open-releases');
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(onAction).toHaveBeenCalledWith('close');
  });

  it('offers retry for check failures and install failures', async () => {
    let onAction = await renderPhase({
      kind: 'error',
      message: 'You appear to be offline. Try again.',
      retry: 'check',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledWith('retry');
    expect(screen.getByRole('button', { name: 'View releases' })).toBeOnTheScreen();

    onAction = await renderPhase({
      kind: 'error',
      message: 'Could not open the installer.',
      retry: 'install',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Try installing again' }));
    expect(onAction).toHaveBeenCalledWith('retry');
  });

  it('offers in-place download with the size when supported', async () => {
    const onAction = await renderPhase({
      kind: 'update',
      current: '1.2.1',
      latest: LATEST,
      canInstall: true,
    });
    expect(screen.getByText('Update available')).toBeOnTheScreen();
    expect(screen.getByText('34.0 MB download.', { exact: false })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Download & install' }));
    expect(onAction).toHaveBeenCalledWith('download');
    await fireEvent.press(screen.getByRole('button', { name: 'Release notes' }));
    expect(onAction).toHaveBeenCalledWith('open-release');
  });

  it('falls back to the release page otherwise', async () => {
    const onAction = await renderPhase({
      kind: 'update',
      current: null,
      latest: LATEST,
      canInstall: false,
    });
    expect(screen.getByText('Installed vunknown.', { exact: false })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'View release' }));
    expect(onAction).toHaveBeenCalledWith('open-release');
  });

  it('shows determinate and indeterminate download progress', async () => {
    await renderPhase({ kind: 'downloading', latest: LATEST, progress: 0.5 });
    expect(screen.getByText('Downloading update')).toBeOnTheScreen();
    expect(screen.getByText('50%')).toBeOnTheScreen();

    await renderPhase({ kind: 'downloading', latest: LATEST, progress: null });
    expect(screen.getAllByText('Downloading update').length).toBeGreaterThan(0);
  });

  it('confirms before installing and opens the installer on confirm', async () => {
    const onAction = await renderPhase({ kind: 'ready', latest: LATEST });
    expect(screen.getByText('Download complete')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Install update' }));
    expect(onAction).toHaveBeenCalledWith('install');
  });

  it('explains the installer wait', async () => {
    await renderPhase({ kind: 'installing' });
    expect(screen.getByText('Opening installer…')).toBeOnTheScreen();
  });
});
