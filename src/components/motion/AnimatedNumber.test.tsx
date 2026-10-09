import { render, screen, waitFor } from '@testing-library/react-native';

import { AnimatedNumber } from '@/components/motion/AnimatedNumber';

describe('AnimatedNumber', () => {
  it('renders the formatted value', async () => {
    await render(<AnimatedNumber value={12} format={(value) => `${value} QPS`} />);
    expect(screen.getByText('12 QPS')).toBeOnTheScreen();
  });

  it('updates when the value changes', async () => {
    const { rerender } = await render(<AnimatedNumber value={1} format={(value) => `${value}`} />);
    await rerender(<AnimatedNumber value={2} format={(value) => `${value}`} />);
    await waitFor(() => expect(screen.getByText('2')).toBeOnTheScreen());
  });
});
