import { AccessibilityInfo } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { BootError, BootLoading } from '@/components/BootState';

jest.unmock('@/components/motion/reducedMotion');

describe('BootState', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a static loading placeholder under reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await render(<BootLoading />);
    expect(screen.getByText('Loading your estimates…')).toBeOnTheScreen();
  });

  it('renders an animated loading placeholder otherwise', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(<BootLoading />);
    expect(screen.getByText('Loading your estimates…')).toBeOnTheScreen();
  });

  it('offers retry and reset when loading fails', async () => {
    const onRetry = jest.fn();
    const onReset = jest.fn();
    await render(<BootError onRetry={onRetry} onReset={onReset} />);
    expect(screen.getByText('Couldn’t load saved data')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Reset saved data' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
