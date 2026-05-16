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

  // Mediana
  const median = n % 2 === 0
    ? (values[n / 2 - 1] + values[n / 2]) / 2
    : values[Math.floor(n / 2)];

  // Dominanta (Mode) - zaokrąglona do 4 miejsc po przecinku jak w NBP
  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let mode = values[0];
  values.forEach(v => {
    const valStr = v.toFixed(4);
    frequency[valStr] = (frequency[valStr] || 0) + 1;
    if (frequency[valStr] > maxFreq) {
      maxFreq = frequency[valStr];
      mode = parseFloat(valStr);
    }
  });

  // Odchylenie standardowe
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);

  // Współczynnik zmienności (Coefficient of Variation) w procentach
  const coefficientOfVariation = (standardDeviation / mean) * 100;

  return {
    median: median.toFixed(4),
    mode: mode.toFixed(4),
    standardDeviation: standardDeviation.toFixed(4),
    coefficientOfVariation: coefficientOfVariation.toFixed(2)
  };
};