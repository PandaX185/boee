import { render, screen } from '@testing-library/react-native';

import { BrandHeader } from '@/components/BrandHeader';

describe('BrandHeader', () => {
  it('shows the brand name and tagline', async () => {
    await render(<BrandHeader />);
    expect(screen.getByText('BOEE')).toBeOnTheScreen();
    expect(screen.getByText('Back of Envelope Estimator')).toBeOnTheScreen();
  });
});
