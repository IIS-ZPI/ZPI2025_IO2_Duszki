import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CurrencyColumn } from './CurrencyColumn';

describe('CurrencyColumn Component', () => {
  const mockOnCurrencyChange = vi.fn();

  const mockData = {
    table: 'A',
    currency: 'dolar amerykański',
    code: 'USD',
    rates: [
      { no: '1', effectiveDate: '2026-05-20', mid: 4.0 },
      { no: '2', effectiveDate: '2026-05-21', mid: 4.1 },
      { no: '3', effectiveDate: '2026-05-22', mid: 4.1 },
      { no: '4', effectiveDate: '2026-05-23', mid: 3.9 },
    ]
  };

  it('renders default state correctly when data is null', () => {
    render(<CurrencyColumn selectedCurrency="USD" onCurrencyChange={mockOnCurrencyChange} data={null} />);

    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();

    expect(screen.getByText('Upward sessions').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('No-change sessions').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Downward sessions').nextElementSibling).toHaveTextContent('0');

    expect(screen.getByText('Median').nextElementSibling).toHaveTextContent('-');
    expect(screen.getByText('Mode').nextElementSibling).toHaveTextContent('-');
    expect(screen.getByText('Standard Deviation').nextElementSibling).toHaveTextContent('-');
    expect(screen.getByText('Coefficient of Variation').nextElementSibling).toHaveTextContent('-');
  });

  it('renders calculated statistics and sessions correctly when data is provided', () => {
    render(<CurrencyColumn selectedCurrency="USD" onCurrencyChange={mockOnCurrencyChange} data={mockData} />);

    expect(screen.getByText('Upward sessions').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('No-change sessions').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Downward sessions').nextElementSibling).toHaveTextContent('1');

    expect(screen.getByText('Median').nextElementSibling).not.toHaveTextContent('-');
    expect(screen.getByText('Standard Deviation').nextElementSibling).not.toHaveTextContent('-');
  });

  it('calls onCurrencyChange when a new currency is selected from the dropdown', () => {
    render(<CurrencyColumn selectedCurrency="USD" onCurrencyChange={mockOnCurrencyChange} data={null} />);

    const select = screen.getByDisplayValue('USD');
    fireEvent.change(select, { target: { value: 'EUR' } });

    expect(mockOnCurrencyChange).toHaveBeenCalledWith('EUR');
  });

  it('handles "No mode" correctly without appending " PLN"', () => {
    const noModeData = {
      table: 'A',
      currency: 'Euro',
      code: 'EUR',
      rates: [
        { no: '1', effectiveDate: '2026-05-20', mid: 4.0 },
        { no: '2', effectiveDate: '2026-05-21', mid: 4.1 },
        { no: '3', effectiveDate: '2026-05-22', mid: 4.2 },
      ]
    };

    render(<CurrencyColumn selectedCurrency="EUR" onCurrencyChange={mockOnCurrencyChange} data={noModeData} />);

    const modeValue = screen.getByText('Mode').nextElementSibling;

    expect(modeValue).toHaveTextContent('No mode');
    expect(modeValue).not.toHaveTextContent('No mode PLN');
  });

  it('appends " PLN" and "%" correctly to valid numerical stats', () => {
    const validStatsData = {
      table: 'A',
      currency: 'Euro',
      code: 'EUR',
      rates: [
        { no: '1', effectiveDate: '2026-05-20', mid: 4.1 },
        { no: '2', effectiveDate: '2026-05-21', mid: 4.1 },
        { no: '3', effectiveDate: '2026-05-22', mid: 4.5 },
      ]
    };

    render(<CurrencyColumn selectedCurrency="EUR" onCurrencyChange={mockOnCurrencyChange} data={validStatsData} />);

    expect(screen.getByText('Median').nextElementSibling?.textContent).toMatch(/PLN$/);
    expect(screen.getByText('Mode').nextElementSibling?.textContent).toMatch(/PLN$/);
    expect(screen.getByText('Standard Deviation').nextElementSibling?.textContent).toMatch(/PLN$/);
    
    expect(screen.getByText('Coefficient of Variation').nextElementSibling?.textContent).toMatch(/%$/);
  });
});