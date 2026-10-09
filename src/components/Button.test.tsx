import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders the label and fires onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the secondary variant', async () => {
    const onPress = jest.fn();
    await render(<Button label="Cancel" variant="secondary" onPress={onPress} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen();
  });
});
