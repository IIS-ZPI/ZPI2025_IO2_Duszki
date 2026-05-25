import React from 'react';
import { StatBox } from './StatBox';
import { calculateSessions, calculateStats } from '../utils/statistics';
import { NBPExchangeRates } from '../api/types';

// List of the most popular currencies from NBP Table A
const AVAILABLE_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'CZK'];

interface CurrencyColumnProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  data: NBPExchangeRates | null;
}

export const CurrencyColumn = ({ selectedCurrency, onCurrencyChange, data }: CurrencyColumnProps) => {
  const sessions = data ? calculateSessions(data.rates) : { upward: 0, downward: 0, noChange: 0 };
  const defaultStats = { median: '-', mode: '-', standardDeviation: '-', coefficientOfVariation: '-' };
  const rawStats = data ? calculateStats(data.rates) : null;
  const stats = rawStats ?? defaultStats;

  const IconUpward = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L15 9m0 0v4m0-4h-4" />
    </svg>
  );

  const IconEquals = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10h6m-6 4h6" />
    </svg>
  );

  const IconDownward = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l6 6m0 0v-4m0 4h-4" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* Large Currency Selector */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm text-center relative">
        <select
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full text-2xl font-semibold text-gray-800 py-4 appearance-none text-center bg-transparent cursor-pointer focus:outline-none"
          style={{ textAlignLast: 'center' }}
        >
          {AVAILABLE_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* Tiles grid */}
      <div className="grid grid-cols-3 gap-4">
         <StatBox title="Upward sessions" value={sessions.upward} valueColor="text-[#217d4e]" icon={IconUpward} />
         <StatBox title="No-change sessions" value={sessions.noChange} valueColor="text-yellow-500" icon={IconEquals} />
         <StatBox title="Downward sessions" value={sessions.downward} valueColor="text-red-600" icon={IconDownward} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatBox title="Median" value={`${stats.median} PLN`} />
        <StatBox title="Mode" value={`${stats.mode} PLN`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatBox title="Standard Deviation" value={`${stats.standardDeviation} PLN`} />
        <StatBox title="Coefficient of Variation" value={stats.coefficientOfVariation !== '-' ? `${stats.coefficientOfVariation}%` : '-'} />
      </div>
    </div>
  );
};