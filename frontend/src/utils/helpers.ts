import { NBPExchangeRates } from '../api/types';

// Subtract exact number of days as required by the specification (T - days)
export const getDateRange = (timeframe: string) => {
  const end = new Date();
  const start = new Date();

  switch(timeframe) {
    case '1w': start.setDate(end.getDate() - 7); break;
    case '2w': start.setDate(end.getDate() - 14); break;
    case '1m': start.setDate(end.getDate() - 30); break;
    case '1q': start.setDate(end.getDate() - 90); break;
    case '6m': start.setDate(end.getDate() - 180); break;
    case '1y': start.setDate(end.getDate() - 365); break;
    default: start.setDate(end.getDate() - 30); // Default to 1 month (30 days)
  }

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: formatDate(start), endDate: formatDate(end) };
};

export const generateHistogramData = (data1: NBPExchangeRates | null, data2: NBPExchangeRates | null) => {
  if (!data1 || !data2 || data1.rates.length === 0 || data2.rates.length === 0) return [];

  const rates2Map = new Map<string, number>();
  data2.rates.forEach(r => rates2Map.set(r.effectiveDate, r.mid));

  const changes: number[] = [];
  let prevPairRate: number | null = null;

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

  const minChange = Math.min(...changes);
  const maxChange = Math.max(...changes);

  if (minChange === maxChange) {
    return [{
      min: minChange.toFixed(4),
      max: maxChange.toFixed(4),
      label: minChange.toFixed(4),
      uv: changes.length
    }];
  }

  // EQUATION 4 FROM SPECIFICATION: k = ceil(sqrt(n))
  const numBins = Math.ceil(Math.sqrt(changes.length));
  const step = (maxChange - minChange) / numBins;

  const bins = Array.from({ length: numBins }, (_, i) => ({
    min: minChange + i * step,
    max: minChange + (i + 1) * step,
    count: 0
  }));

  changes.forEach(change => {
    let binIndex = Math.floor((change - minChange) / step);
    if (binIndex >= numBins) binIndex = numBins - 1;
    if (binIndex < 0) binIndex = 0;
    bins[binIndex].count++;
  });

  return bins.map(bin => ({
    min: bin.min.toFixed(4),
    max: bin.max.toFixed(4),
    label: bin.min.toFixed(4),
    uv: bin.count
  }));
};