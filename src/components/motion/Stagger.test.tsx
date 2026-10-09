import { AccessibilityInfo, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { Stagger } from '@/components/motion/Stagger';

jest.unmock('@/components/motion/reducedMotion');

describe('Stagger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('staggers children when motion is allowed', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(
      <Stagger>
        <Text>First</Text>
        <Text>Second</Text>
      </Stagger>,
    );
    expect(screen.getByText('First')).toBeOnTheScreen();
    expect(screen.getByText('Second')).toBeOnTheScreen();
  });
});
