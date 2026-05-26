import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Dashboard } from './Dashboard';
import * as api from '../api/api';

vi.mock('../api/api');

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...(actual as any),
    ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
    BarChart: () => <div data-testid="bar-chart-mock">BarChart Mock</div>,
  };
});

const mockApiResponse = {
  table: 'A',
  currency: 'Test Currency',
  code: 'TST',
  rates: [{ no: '1', effectiveDate: '2026-05-25', mid: 4.5 }]
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchRatesByDateRange as Mock).mockResolvedValue(mockApiResponse);
  });

  it('renders initial dashboard structure correctly', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(4);
    });

    expect(screen.getByAltText('CAS Logo')).toBeInTheDocument();
    expect(screen.getByText('Choose timeframe')).toBeInTheDocument();
    expect(screen.getByText(/Quarterly changes distribution/i)).toBeInTheDocument();
  });

  it('toggles distribution mode between Month and Quarter', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(4);
    });

    const monthButton = screen.getByText('Month');
    const quarterButton = screen.getByText('Quarter');

    fireEvent.click(monthButton);
    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(6);
    });
    expect(screen.getByText(/Monthly changes distribution/i)).toBeInTheDocument();

    fireEvent.click(quarterButton);
    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(8);
    });
    expect(screen.getByText(/Quarterly changes distribution/i)).toBeInTheDocument();
  });

  it('calls fetchRatesByDateRange when timeframe is changed', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(4);
    });

    vi.clearAllMocks();

    const timeframeSelect = screen.getByDisplayValue('Choose timeframe');
    
    fireEvent.change(timeframeSelect, { target: { value: '1m' } });

    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(2);
    });
  });
});