import { AccessibilityInfo, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { PressableScale } from '@/components/motion/PressableScale';

jest.unmock('@/components/motion/reducedMotion');

describe('PressableScale', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('animates the press lifecycle and forwards handlers', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();

    await render(
      <PressableScale
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text>tap</Text>
      </PressableScale>,
    );

    const button = screen.getByRole('button', { name: 'tap' });
    await fireEvent(button, 'pressIn');
    await fireEvent(button, 'pressOut');
    await fireEvent.press(button);

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('skips springs under reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const onPressIn = jest.fn();
    await render(
      <PressableScale accessibilityRole="button" onPressIn={onPressIn} onPress={() => undefined}>
        <Text>calm</Text>
      </PressableScale>,
    );
    await act(async () => undefined);
    await fireEvent(screen.getByRole('button', { name: 'calm' }), 'pressIn');
    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  it('skips the spring when disabled', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(
      <PressableScale accessibilityRole="button" disabled onPress={() => undefined}>
        <Text>disabled</Text>
      </PressableScale>,
    );

    const button = screen.getByRole('button', { name: 'disabled' });
    await fireEvent(button, 'pressIn');
    await fireEvent(button, 'pressOut');
    expect(button).toBeOnTheScreen();
  });
});
