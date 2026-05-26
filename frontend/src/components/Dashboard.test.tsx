import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Dashboard } from './Dashboard';
import * as api from '../api/api';

vi.mock('../api/api');

// Mockowanie biblioteki recharts, aby uniknąć problemów z renderowaniem SVG w JSDOM
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

    // Na starcie wywołują się tylko 2 zapytania dla sekcji dolnej (topTimeframe jest puste)
    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByAltText('CAS Logo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Choose timeframe')).toBeInTheDocument();
    // Domyślny widok to teraz 'Month', a tekst to "Monthly change distribution"
    expect(screen.getByText(/Monthly change distribution/i)).toBeInTheDocument();
  });

  it('toggles distribution mode between Month and Quarter', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(2);
    });

    const monthButton = screen.getByText('Month');
    const quarterButton = screen.getByText('Quarter');

    // Najpierw klikamy Quarter (ponieważ Month jest aktywne domyślnie)
    fireEvent.click(quarterButton);
    await waitFor(() => {
      // 2 początkowe + 2 po zmianie na Quarter = 4
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(4);
    });
    expect(screen.getByText(/Quarterly change distribution/i)).toBeInTheDocument();

    // Następnie wracamy do Month
    fireEvent.click(monthButton);
    await waitFor(() => {
      // 4 + 2 po zmianie na Month = 6
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(6);
    });
    expect(screen.getByText(/Monthly change distribution/i)).toBeInTheDocument();
  });

  it('calls fetchRatesByDateRange when timeframe is changed', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(2);
    });

    // Czyścimy mocki, żeby policzyć tylko wywołania po zmianie Selecta
    vi.clearAllMocks();

    const timeframeSelect = screen.getByDisplayValue('Choose timeframe');

    // Użytkownik wybiera z listy np. '1m'
    fireEvent.change(timeframeSelect, { target: { value: '1m' } });

    await waitFor(() => {
      // Powinny polecieć 2 zapytania z górnego useEffecta
      expect(api.fetchRatesByDateRange).toHaveBeenCalledTimes(2);
    });
  });
});