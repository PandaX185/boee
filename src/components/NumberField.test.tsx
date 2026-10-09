import { fireEvent, render, screen } from '@testing-library/react-native';

import { NumberField } from '@/components/NumberField';

describe('NumberField', () => {
  it('renders the label, initial value, and hint', async () => {
    await render(
      <NumberField label="Daily active users" value={1000} hint="a hint" onChange={() => {}} />,
    );
    expect(screen.getByText('Daily active users')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('1000')).toBeOnTheScreen();
    expect(screen.getByText('a hint')).toBeOnTheScreen();
  });

  it('emits parsed numbers', async () => {
    const onChange = jest.fn();
    await render(<NumberField label="DAU" value={1000} onChange={onChange} />);
    await fireEvent.changeText(screen.getByDisplayValue('1000'), '2500');
    expect(onChange).toHaveBeenCalledWith(2500);
  });

  it('accepts comma decimals', async () => {
    const onChange = jest.fn();
    await render(<NumberField label="Ratio" value={1} onChange={onChange} />);
    await fireEvent.changeText(screen.getByDisplayValue('1'), '1,5');
    expect(onChange).toHaveBeenCalledWith(1.5);
  });

  it('ignores empty and invalid input', async () => {
    const onChange = jest.fn();
    await render(<NumberField label="DAU" value={1000} onChange={onChange} />);
    const input = screen.getByDisplayValue('1000');
    await fireEvent.changeText(input, '');
    await fireEvent.changeText(input, 'abc');
    expect(onChange).not.toHaveBeenCalled();
  });
});
