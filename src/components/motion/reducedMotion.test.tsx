import { AccessibilityInfo, Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';

import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';

jest.unmock('@/components/motion/reducedMotion');

function Probe() {
  const reduced = usePrefersReducedMotion();
  return <Text>{reduced ? 'reduced' : 'full'}</Text>;
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports a reduced-motion preference', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await render(<Probe />);
    await waitFor(() => expect(screen.getByText('reduced')).toBeOnTheScreen());
  });

  it('reports full motion when the OS allows it', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(<Probe />);
    await waitFor(() => expect(screen.getByText('full')).toBeOnTheScreen());
  });
});
