import { AccessibilityInfo, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { Reveal } from '@/components/motion/Reveal';

jest.unmock('@/components/motion/reducedMotion');

describe('Reveal', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children', async () => {
    await render(
      <Reveal delay={120}>
        <Text>Revealed content</Text>
      </Reveal>,
    );
    expect(screen.getByText('Revealed content')).toBeOnTheScreen();
  });

  it('reveals without an explicit delay', async () => {
    await render(
      <Reveal>
        <Text>Default delay content</Text>
      </Reveal>,
    );
    expect(screen.getByText('Default delay content')).toBeOnTheScreen();
  });

  it('animates entrances when motion is allowed', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(
      <Reveal delay={120}>
        <Text>Animated content</Text>
      </Reveal>,
    );
    expect(screen.getByText('Animated content')).toBeOnTheScreen();
  });
});
