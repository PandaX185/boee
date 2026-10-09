import { fireEvent, render, screen } from '@testing-library/react-native';

import { SizeField } from '@/components/SizeField';

describe('SizeField', () => {
  it('renders the label and picks a unit for the value', async () => {
    await render(<SizeField label="Object size" value={2048} onChange={() => {}} />);
    expect(screen.getByText('Object size')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('2')).toBeOnTheScreen();
  });

  it('emits bytes for the typed amount and selected unit', async () => {
    const onChange = jest.fn();
    await render(<SizeField label="Object size" value={2048} onChange={onChange} />);
    await fireEvent.changeText(screen.getByDisplayValue('2'), '3');
    expect(onChange).toHaveBeenCalledWith(3 * 1024);
  });

  it('converts when the unit changes', async () => {
    const onChange = jest.fn();
    await render(<SizeField label="Object size" value={2048} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'MB' }));
    expect(onChange).toHaveBeenCalledWith(2 * 1024 ** 2);
  });
});
