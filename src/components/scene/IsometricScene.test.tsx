import { AccessibilityInfo } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { IsometricScene } from '@/components/scene/IsometricScene';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { PRESETS } from '@/core/presets';
import { buildScene } from '@/core/scene';

jest.unmock('@/components/motion/reducedMotion');

const inputs = PRESETS[0].inputs;
const { derived, implications } = evaluate(inputs, DEFAULT_CONSTANTS);
const model = buildScene(inputs, derived, implications, DEFAULT_CONSTANTS);

describe('IsometricScene', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('measures its stage, renders the flow and selects a node', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const onSelect = jest.fn();

    await render(<IsometricScene model={model} selected={null} onSelect={onSelect} />);

    await fireEvent(screen.getByTestId('system-scene-stage'), 'layout', {
      nativeEvent: { layout: { width: 400, height: 288 } },
    });
    expect(screen.getByText('App servers')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: /Traffic/ }));
    expect(onSelect).toHaveBeenCalledWith('traffic');
  });

  it('clears the selection from the stage background', async () => {
    const onSelect = jest.fn();
    await render(<IsometricScene model={model} selected="servers" onSelect={onSelect} />);
    await fireEvent.press(screen.getByLabelText('Clear component selection'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
