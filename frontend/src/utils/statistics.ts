import { NBPRate } from '../api/types';

export const calculateSessions = (rates: NBPRate[]) => {
  let upward = 0, downward = 0, noChange = 0;
  for (let i = 1; i < rates.length; i++) {
    const diff = rates[i].mid - rates[i - 1].mid;
    if (diff > 0) upward++;
    else if (diff < 0) downward++;
    else noChange++;
  }
  return { upward, downward, noChange };
};

export const calculateStats = (rates: NBPRate[]) => {
  if (!rates || rates.length === 0) return null;

  const values = rates.map(r => r.mid).sort((a, b) => a - b);
  const n = values.length;

  // 1. Median
  const median = n % 2 === 0
    ? (values[n / 2 - 1] + values[n / 2]) / 2
    : values[Math.floor(n / 2)];

  // 2. Mode (compliant with specification rules)
  const frequency: Record<string, number> = {};
  let maxFreq = 0;

  values.forEach(v => {
    const valStr = v.toFixed(4);
    frequency[valStr] = (frequency[valStr] || 0) + 1;
    if (frequency[valStr] > maxFreq) {
      maxFreq = frequency[valStr];
    }
  });

  const uniqueModes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
  const uniqueFrequencies = new Set(Object.values(frequency));

  let modeResult: string;
  // If all values occur with the same frequency -> no mode
  if (uniqueFrequencies.size === 1) {
    modeResult = "No mode";
  }
  // If more than one value shares the maximum frequency -> multiple modes
  else if (uniqueModes.length > 1) {
    modeResult = "Multiple modes";
  }
  // Otherwise, we have a single mode
  else {
    modeResult = uniqueModes[0];
  }

  // 3. Standard Deviation
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);

  // 4. Coefficient of Variation (checking for division by 0)
  let coefficientOfVariation: string;
  if (mean === 0) {
    coefficientOfVariation = "Cannot calculate";
  } else {
    coefficientOfVariation = ((standardDeviation / mean) * 100).toFixed(2);
  }

  return {
    median: median.toFixed(4),
    mode: modeResult,
    standardDeviation: standardDeviation.toFixed(4),
    coefficientOfVariation
  };
};