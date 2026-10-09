import { Alert, Platform } from 'react-native';

import { confirmDestructive } from '@/services/confirm';

const previousOs = Platform.OS;
const previousWindow = (globalThis as { window?: unknown }).window;

afterEach(() => {
  Platform.OS = previousOs;
  (globalThis as { window?: unknown }).window = previousWindow;
  jest.restoreAllMocks();
});

describe('confirmDestructive', () => {
  it('runs onConfirm when the destructive button is pressed', () => {
    Platform.OS = 'ios';
    const alertMock = jest.spyOn(Alert, 'alert');
    const onConfirm = jest.fn();
    confirmDestructive('Delete estimate', 'Are you sure?', onConfirm);
    expect(alertMock).toHaveBeenCalledWith('Delete estimate', 'Are you sure?', expect.any(Array));
    const buttons = alertMock.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    buttons.find((button) => button.text === 'Delete')?.onPress?.();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('uses window.confirm on web', () => {
    Platform.OS = 'web';
    const confirmMock = jest.fn(() => true);
    (globalThis as { window?: unknown }).window = { confirm: confirmMock };
    const onConfirm = jest.fn();
    confirmDestructive('Delete estimate', 'Are you sure?', onConfirm);
    expect(confirmMock).toHaveBeenCalledWith('Delete estimate\n\nAre you sure?');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('skips onConfirm when window.confirm is cancelled', () => {
    Platform.OS = 'web';
    (globalThis as { window?: unknown }).window = { confirm: () => false };
    const onConfirm = jest.fn();
    confirmDestructive('Delete estimate', 'Are you sure?', onConfirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
