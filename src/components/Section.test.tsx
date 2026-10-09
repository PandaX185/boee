import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Section } from '@/components/Section';

describe('Section', () => {
  it('renders the title and children', async () => {
    await render(
      <Section title="Traffic">
        <Text>child content</Text>
      </Section>,
    );
    expect(screen.getByText('Traffic')).toBeOnTheScreen();
    expect(screen.getByText('child content')).toBeOnTheScreen();
  });
});
