import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchRatesByDateRange } from '../api/api';
import { NBPExchangeRates } from '../api/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as htmlToImage from 'html-to-image';
import logo from '../assets/cas.png';

import { CurrencyColumn } from './CurrencyColumn';
import { getDateRange, generateHistogramData } from '../utils/helpers';

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

  const chartRef = useRef<HTMLDivElement>(null);

  // Fetching data specifically for the TOP section
  useEffect(() => {
    const loadTopData = async () => {
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
      const bottomTimeframe = distributionMode === 'Month' ? '1m' : '1q';
      const { startDate: calcStart, endDate } = getDateRange(bottomTimeframe);
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

  const histogramData = useMemo(() => generateHistogramData(bottomData1, bottomData2), [bottomData1, bottomData2]);

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
      <header className="w-full bg-[#217d4e] text-white py-4 px-8 shadow-md border-b-4 border-[#175c38]">
        <div className="flex items-center">
          <img src={logo} alt="CAS Logo" className="h-14 w-auto object-contain" />
        </div>
      </header>

      <main className="p-8 w-full">
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm mb-6 mt-2">
           <select
              value={topTimeframe}
              onChange={(e) => setTopTimeframe(e.target.value)}
              className={`w-full bg-transparent text-sm py-4 px-4 focus:outline-none appearance-none cursor-pointer ${topTimeframe === '' ? 'text-gray-400' : 'text-gray-700'}`}
              style={{ textAlignLast: 'center' }}
            >
              <option value="" disabled hidden>Choose timeframe</option>
              <option value="1w">Last 1 week</option>
              <option value="2w">Last 2 weeks</option>
              <option value="1m">Last 1 month</option>
              <option value="1q">Last 1 quarter</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last 1 year</option>
           </select>
           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CurrencyColumn selectedCurrency={currency1} onCurrencyChange={setCurrency1} data={topData1} />
          <CurrencyColumn selectedCurrency={currency2} onCurrencyChange={setCurrency2} data={topData2} />
        </div>

        <section className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{distributionMode}ly changes distribution {currency1} - {currency2}</h3>
              <p className="text-sm text-gray-500">Frequency histogram of value changes within a given timeframe</p>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
               <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white h-[34px]">
                  <button onClick={() => { setDistributionMode('Month'); setStartDate(''); }} className={`px-4 text-sm font-medium transition-colors ${distributionMode === 'Month' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Month</button>
                  <button onClick={() => { setDistributionMode('Quarter'); setStartDate(''); }} className={`px-4 text-sm font-medium border-l border-gray-200 transition-colors ${distributionMode === 'Quarter' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Quarter</button>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-500 mb-1 ml-1 tracking-wider">Start date</span>
                  <div className="border border-gray-200 rounded-md px-2 py-1.5 flex items-center bg-white h-[34px]">
                     <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer w-full px-1" />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
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
              <div className="flex justify-end mt-2">
                <button onClick={handleSavePNG} className="text-sm font-bold text-gray-500 hover:text-gray-800 inline-flex items-center gap-1.5 transition-colors pr-1" disabled={histogramData.length === 0}>
                  Save <svg className="w-5 h-5 text-[#357850] ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" /></svg>
                </button>
              </div>
            </div>

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
               <div className="flex justify-end mt-3">
                <button onClick={handleSaveCSV} className="text-sm font-bold text-gray-500 hover:text-gray-800 inline-flex items-center gap-1.5 transition-colors pr-1" disabled={histogramData.length === 0}>
                  Save <svg className="w-5 h-5 text-[#357850] ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" /></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};