import { render, screen } from '@testing-library/react-native';

import { ImplicationList } from '@/components/ImplicationList';
import type { Implication } from '@/domain/types';

const IMPLICATIONS: Implication[] = [
  { id: 'a', category: 'storage', severity: 'info', message: 'Info message', trigger: 't1' },
  {
    id: 'b',
    category: 'throughput',
    severity: 'warning',
    message: 'Warning message',
    trigger: 't2',
  },
];

describe('ImplicationList', () => {
  it('shows an empty state when nothing triggered', async () => {
    await render(<ImplicationList implications={[]} />);
    expect(
      screen.getByText('No implications triggered with the current assumptions.'),
    ).toBeOnTheScreen();
  });

  it('lists each message with its trigger', async () => {
    await render(<ImplicationList implications={IMPLICATIONS} />);
    expect(screen.getByText('Info message')).toBeOnTheScreen();
    expect(screen.getByText('trigger: t1')).toBeOnTheScreen();
    expect(screen.getByText('Warning message')).toBeOnTheScreen();
    expect(screen.getByText('trigger: t2')).toBeOnTheScreen();
  });

  it('groups implications under category headers in category order', async () => {
    await render(<ImplicationList implications={IMPLICATIONS} />);
    const headers = screen.getAllByText(/Throughput|Storage/);
    expect(headers.map((header) => header.props.children)).toEqual(['Throughput', 'Storage']);
  });

  it('orders warnings before info', async () => {
    await render(<ImplicationList implications={IMPLICATIONS} />);
    const metas = screen.getAllByText(/WARNING|INFO/, { exact: false });
    expect(metas[0]).toHaveTextContent('WARNING');
    expect(metas[1]).toHaveTextContent('INFO');
  });
});
