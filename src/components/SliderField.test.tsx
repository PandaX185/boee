import { fireEvent, render, screen } from '@testing-library/react-native';

import { SliderField } from '@/components/SliderField';

describe('SliderField', () => {
  it('renders the label and formatted value', async () => {
    await render(
      <SliderField
        label="Peak multiplier"
        value={3}
        min={1}
        max={10}
        step={0.5}
        format={(value) => `${value}x`}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Peak multiplier')).toBeOnTheScreen();
    expect(screen.getByText('3x')).toBeOnTheScreen();
  });

  it('emits slider changes', async () => {
    const onChange = jest.fn();
    await render(
      <SliderField label="Peak" value={3} min={1} max={10} step={0.5} onChange={onChange} />,
    );
    await fireEvent(screen.getByTestId('mock-slider'), 'valueChange', 7);
    expect(onChange).toHaveBeenCalledWith(7);
  });
});
