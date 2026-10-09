import { render, screen } from '@testing-library/react-native';

import { ImplicationList } from '@/components/ImplicationList';
import type { Implication } from '@/domain/types';

describe('ImplicationList', () => {
  it('shows an empty state when nothing triggered', async () => {
    await render(<ImplicationList implications={[]} />);
    expect(
      screen.getByText('No implications triggered with the current assumptions.'),
    ).toBeOnTheScreen();
  });

  it('lists each message with its trigger', async () => {
    const implications: Implication[] = [
      { id: 'a', category: 'storage', severity: 'info', message: 'Info message', trigger: 't1' },
      {
        id: 'b',
        category: 'scaling',
        severity: 'warning',
        message: 'Warning message',
        trigger: 't2',
      },
    ];
    await render(<ImplicationList implications={implications} />);
    expect(screen.getByText('Info message')).toBeOnTheScreen();
    expect(screen.getByText('trigger: t1')).toBeOnTheScreen();
    expect(screen.getByText('Warning message')).toBeOnTheScreen();
    expect(screen.getByText('trigger: t2')).toBeOnTheScreen();
  });

  it('orders warnings before info', async () => {
    const implications: Implication[] = [
      { id: 'a', category: 'storage', severity: 'info', message: 'Info message', trigger: 't1' },
      {
        id: 'b',
        category: 'scaling',
        severity: 'warning',
        message: 'Warning message',
        trigger: 't2',
      },
    ];
    await render(<ImplicationList implications={implications} />);
    const metas = screen.getAllByText(/WARNING|INFO/, { exact: false });
    expect(metas[0]).toHaveTextContent('WARNING · scaling');
    expect(metas[1]).toHaveTextContent('INFO · storage');
  });
});
