import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchRatesByDateRange } from '../api/api';
import { calculateSessions, calculateStats } from '../utils/statistics';
import { NBPExchangeRates } from '../api/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as htmlToImage from 'html-to-image';
import logo from '../assets/cas.png';

// List of the most popular currencies from NBP Table A
const AVAILABLE_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'CZK'];

// Helper function to calculate dates based on the selected timeframe
const getDateRange = (timeframe: string) => {
  const end = new Date();
  const start = new Date();

  switch(timeframe) {
    case '1w': start.setDate(end.getDate() - 7); break;
    case '2w': start.setDate(end.getDate() - 14); break;
    case '1m': start.setMonth(end.getMonth() - 1); break;
    case '1q': start.setMonth(end.getMonth() - 3); break;
    case '6m': start.setMonth(end.getMonth() - 6); break;
    case '1y': start.setFullYear(end.getFullYear() - 1); break;
    default: start.setMonth(end.getMonth() - 1); // Default to 1 month if none is selected
  }

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: formatDate(start), endDate: formatDate(end) };
};

// Function: Calculating DYNAMIC histogram data for ANY currency pair
const generateHistogramData = (data1: NBPExchangeRates | null, data2: NBPExchangeRates | null) => {
  if (!data1 || !data2 || data1.rates.length === 0 || data2.rates.length === 0) return [];

  // Mapping dates of the second currency for quick lookup
  const rates2Map = new Map<string, number>();
  data2.rates.forEach(r => rates2Map.set(r.effectiveDate, r.mid));

  const changes: number[] = [];
  let prevPairRate: number | null = null;

  // Calculating pair rate and day-to-day difference
  for (let i = 0; i < data1.rates.length; i++) {
    const date = data1.rates[i].effectiveDate;
    const rate1 = data1.rates[i].mid;
    const rate2 = rates2Map.get(date);

    if (rate2) {
      const currentPairRate = rate1 / rate2;
      if (prevPairRate !== null) {
        changes.push(currentPairRate - prevPairRate);
      }
      prevPairRate = currentPairRate;
    }
  }

  if (changes.length === 0) return [];

  // --- DYNAMIC BINNING ALGORITHM ---
  const minChange = Math.min(...changes);
  const maxChange = Math.max(...changes);

  // Fallback if all changes are exactly the same (0 volatility)
  if (minChange === maxChange) {
    return [{
      min: minChange.toFixed(4),
      max: maxChange.toFixed(4),
      label: minChange.toFixed(4),
      uv: changes.length
    }];
  }

  const numBins = 12; // 12 bins look clean and readable on a standard chart
  const step = (maxChange - minChange) / numBins;

  // Initialize empty bins
  const bins = Array.from({ length: numBins }, (_, i) => ({
    min: minChange + i * step,
    max: minChange + (i + 1) * step,
    count: 0
  }));

  // Assign changes to their respective bins
  changes.forEach(change => {
    let binIndex = Math.floor((change - minChange) / step);
    // Boundary safety for the absolute max value
    if (binIndex >= numBins) binIndex = numBins - 1;
    if (binIndex < 0) binIndex = 0;

    bins[binIndex].count++;
  });

  // Format data for Recharts and the Table
  return bins.map(bin => ({
    min: bin.min.toFixed(4),
    max: bin.max.toFixed(4),
    label: bin.min.toFixed(4), // X-axis label
    uv: bin.count
  }));
};

export const Dashboard = () => {
  // --- SHARED STATES ---
  const [currency1, setCurrency1] = useState('CHF');
  const [currency2, setCurrency2] = useState('USD');

  // --- TOP SECTION STATES (Stats & Tiles) ---
  const [topTimeframe, setTopTimeframe] = useState('');
  const [topData1, setTopData1] = useState<NBPExchangeRates | null>(null);
  const [topData2, setTopData2] = useState<NBPExchangeRates | null>(null);

  // --- BOTTOM SECTION STATES (Histogram & Table) ---
  const [distributionMode, setDistributionMode] = useState<'Month' | 'Quarter'>('Quarter');
  const [startDate, setStartDate] = useState<string>('');
  const [bottomData1, setBottomData1] = useState<NBPExchangeRates | null>(null);
  const [bottomData2, setBottomData2] = useState<NBPExchangeRates | null>(null);

  // Reference for exporting the chart as PNG
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetching data specifically for the TOP section
  useEffect(() => {
    const loadTopData = async () => {
      // If topTimeframe is empty, fallback to 1 month for default API call
      const { startDate: start, endDate } = getDateRange(topTimeframe || '1m');

      try {
        const [res1, res2] = await Promise.all([
          fetchRatesByDateRange('a', currency1, start, endDate),
          fetchRatesByDateRange('a', currency2, start, endDate)
        ]);
        setTopData1(res1);
        setTopData2(res2);
      } catch (error) {
        console.error("Error fetching top section data from NBP API", error);
      }
    };
    loadTopData();
  }, [topTimeframe, currency1, currency2]);

  // Fetching data specifically for the BOTTOM section
  useEffect(() => {
    const loadBottomData = async () => {
      // Determine base timeframe based on distributionMode
      const bottomTimeframe = distributionMode === 'Month' ? '1m' : '1q';
      const { startDate: calcStart, endDate } = getDateRange(bottomTimeframe);

      // Override with user's selected startDate if it exists
      const finalStartDate = startDate || calcStart;

      try {
        const [res1, res2] = await Promise.all([
          fetchRatesByDateRange('a', currency1, finalStartDate, endDate),
          fetchRatesByDateRange('a', currency2, finalStartDate, endDate)
        ]);
        setBottomData1(res1);
        setBottomData2(res2);
      } catch (error) {
        console.error("Error fetching bottom section data from NBP API", error);
      }
    };
    loadBottomData();
  }, [distributionMode, startDate, currency1, currency2]);

  // Calculating real histogram data using useMemo
  const histogramData = useMemo(() => generateHistogramData(bottomData1, bottomData2), [bottomData1, bottomData2]);

  // Function to export table to CSV
  const handleSaveCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Range Min,Range Max,Changes\n";
    histogramData.forEach(row => {
      csvContent += `${row.min},${row.max},${row.uv}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${distributionMode.toLowerCase()}_distribution_${currency1}_${currency2}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export chart to PNG
  const handleSavePNG = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(chartRef.current, { backgroundColor: '#ffffff' });
        const link = document.createElement('a');
        link.download = `${distributionMode.toLowerCase()}_chart_${currency1}_${currency2}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800">

      {/* Top Header - Full width, logo to the left */}
      <header className="w-full bg-[#217d4e] text-white py-4 px-8 shadow-md border-b-4 border-[#175c38]">
        <div className="flex items-center">
          <img
            src={logo}
            alt="CAS Currency Analysis System Logo"
            className="h-14 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main container full width */}
      <main className="p-8 w-full">

        {/* Timeframe selection controls for TOP SECTION */}
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm mb-6 mt-2">
           <select
              value={topTimeframe}
              onChange={(e) => setTopTimeframe(e.target.value)}
              className={`w-full bg-transparent text-sm py-4 px-4 focus:outline-none appearance-none cursor-pointer ${topTimeframe === '' ? 'text-gray-400' : 'text-gray-700'}`}
              style={{ textAlignLast: 'center' }}
            >
              {/* Hidden placeholder option */}
              <option value="" disabled hidden>Choose timeframe</option>
              <option value="1w">Last 1 week</option>
              <option value="2w">Last 2 weeks</option>
              <option value="1m">Last 1 month</option>
              <option value="1q">Last 1 quarter</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last 1 year</option>
           </select>
           {/* Down arrow for visualization */}
           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
           </div>
        </div>

        {/* Two main columns for currencies (Using topData) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CurrencyColumn
            selectedCurrency={currency1}
            onCurrencyChange={setCurrency1}
            data={topData1}
          />
          <CurrencyColumn
            selectedCurrency={currency2}
            onCurrencyChange={setCurrency2}
            data={topData2}
          />
        </div>

        {/* Histogram and Table section (Using bottomData) */}
        <section className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {distributionMode}ly changes distribution {currency1} - {currency2}
              </h3>
              <p className="text-sm text-gray-500">Frequency histogram of value changes within a given timeframe</p>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
               {/* Month / Quarter toggle */}
               <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white h-[34px]">
                  <button
                    onClick={() => { setDistributionMode('Month'); setStartDate(''); }}
                    className={`px-4 text-sm font-medium transition-colors ${distributionMode === 'Month' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => { setDistributionMode('Quarter'); setStartDate(''); }}
                    className={`px-4 text-sm font-medium border-l border-gray-200 transition-colors ${distributionMode === 'Quarter' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Quarter
                  </button>
               </div>

               {/* Clean Native Date Picker with Label */}
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-500 mb-1 ml-1 tracking-wider">Start date</span>
                  <div className="border border-gray-200 rounded-md px-2 py-1.5 flex items-center bg-white h-[34px]">
                     <input
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                       className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer w-full px-1"
                     />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Chart with attached reference */}
            <div className="flex-1">
              <div ref={chartRef} className="h-80 w-full bg-white pt-4">
                {histogramData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData}>
                      <XAxis dataKey="label" fontSize={12} angle={-45} textAnchor="end" height={60} interval={0} />
                      <YAxis fontSize={12} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} />
                      <Bar dataKey="uv" fill="#357850" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Not enough data to generate the chart</div>
                )}
              </div>

              {/* SAVE button below the chart */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSavePNG}
                  className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1.5 transition-colors pr-1"
                  disabled={histogramData.length === 0}
                >
                  Save <span className="text-[#357850] text-sm">📥</span>
                </button>
              </div>
            </div>

            {/* Bins table */}
            <div className="w-full xl:w-1/3">
               <div className="border border-gray-200 rounded-lg p-4 max-h-[350px] overflow-y-auto">
                 <table className="w-full text-sm text-center">
                   <thead className="sticky top-0 bg-white">
                     <tr className="border-b">
                       <th className="pb-3 font-semibold text-gray-700" colSpan={2}>Range</th>
                       <th className="pb-3 font-semibold text-gray-700">Changes</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {histogramData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-gray-600">{row.min}</td>
                          <td className="py-2 text-gray-600">{row.max}</td>
                          <td className="py-2 text-gray-800 font-medium">{row.uv}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>

               {/* SAVE button below the table */}
               <div className="flex justify-end mt-3">
                <button
                  onClick={handleSaveCSV}
                  className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1.5 transition-colors pr-1"
                  disabled={histogramData.length === 0}
                >
                  Save <span className="text-[#357850] text-sm">📥</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// --- CURRENCY COLUMN COMPONENT --- //
const CurrencyColumn = ({ selectedCurrency, onCurrencyChange, data }: any) => {
  const sessions = data ? calculateSessions(data.rates) : { upward: 0, downward: 0, noChange: 0 };
  const defaultStats = { median: '-', mode: '-', standardDeviation: '-', coefficientOfVariation: '-' };
  const rawStats = data ? calculateStats(data.rates) : null;
  const stats = rawStats ?? defaultStats;

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
        {/* Down arrow for visualization */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* 3 tiles - sessions */}
      <div className="grid grid-cols-3 gap-4">
         <StatBox title="Upward sessions" value={sessions.upward} valueColor="text-[#217d4e]" icon="↗" />
         <StatBox title="No-change sessions" value={sessions.noChange} valueColor="text-yellow-500" icon="=" />
         <StatBox title="Downward sessions" value={sessions.downward} valueColor="text-red-600" icon="↘" />
      </div>

      {/* 2 tiles - Median and Mode */}
      <div className="grid grid-cols-2 gap-4">
        <StatBox title="Median" value={`${stats.median} PLN`} />
        <StatBox title="Mode" value={`${stats.mode} PLN`} />
      </div>

      {/* 2 tiles - Std Dev and Coeff of Var */}
      <div className="grid grid-cols-2 gap-4">
        <StatBox title="Standard Deviation" value={`${stats.standardDeviation} PLN`} />
        <StatBox title="Coefficient of Variation" value={stats.coefficientOfVariation !== '-' ? `${stats.coefficientOfVariation}%` : '-'} />
      </div>
    </div>
  );
};

// --- HELPER TILE COMPONENT --- //
const StatBox = ({ title, value, valueColor = "text-gray-900", icon }: any) => (
  <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center relative">
    {icon && <span className="absolute top-2 right-2 text-gray-300 text-xs">{icon}</span>}
    <span className="text-[10px] uppercase text-gray-500 mb-1 tracking-wider text-center">{title}</span>
    <span className={`text-xl md:text-2xl font-bold ${valueColor}`}>{value}</span>
  </div>
);