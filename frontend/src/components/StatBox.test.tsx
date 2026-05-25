import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { StatBox } from './StatBox';

describe('StatBox Component', () => {
  it('renders title and value correctly', () => {
    render(<StatBox title="Test Median" value="4.2950 PLN" />);

    expect(screen.getByText('Test Median')).toBeInTheDocument();
    expect(screen.getByText('4.2950 PLN')).toBeInTheDocument();
  });

  it('applies custom value color', () => {
    render(<StatBox title="Downward" value="12" valueColor="text-red-600" />);

    const valueElement = screen.getByText('12');
    expect(valueElement).toHaveClass('text-red-600');
  });

  it('renders an icon if provided', () => {
    const CustomIcon = <svg data-testid="custom-icon" />;
    render(<StatBox title="With Icon" value="5" icon={CustomIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});