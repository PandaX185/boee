import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChoiceChips } from '@/components/ChoiceChips';

describe('ChoiceChips', () => {
  it('renders every option and emits the chosen value', async () => {
    const onChange = jest.fn();
    await render(
      <ChoiceChips
        options={[
          { label: 'Low', value: 'low' },
          { label: 'High', value: 'high' },
        ]}
        value="low"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('button', { name: 'Low' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'High' }));
    expect(onChange).toHaveBeenCalledWith('high');
  });
});
