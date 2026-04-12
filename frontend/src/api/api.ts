import { NBPTable, NBPExchangeRates } from './types';

const RATES_URL = import.meta.env.VITE_NBP_RATES_URL;
const TABLES_URL = import.meta.env.VITE_NBP_TABLES_URL;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 404) {
        return null;
    }
    throw new Error(`NBP API response: ${response.statusText}`);
  }
  return response.json();
};

export const fetchCurrentTable = async (table: 'a' | 'b'): Promise<NBPTable[]> => {
  const response = await fetch(`${TABLES_URL}/${table}/?format=json`);
  return handleResponse(response);
};

export const fetchRatesByDateRange = async (
  table: 'a' | 'b',
  code: string,
  start: string,
  end: string
): Promise<NBPExchangeRates> => {
  const response = await fetch(`${RATES_URL}/${table}/${code}/${start}/${end}/?format=json`);
  return handleResponse(response);
};

export const fetchLastRates = async (table: 'a' | 'b', code: string, count: number): Promise<NBPExchangeRates> => {
  const response = await fetch(`${RATES_URL}/${table}/${code}/last/${count}/?format=json`);
  return handleResponse(response);
};

export const fetchRateOnDate = async (table: 'a' | 'b', code: string, date: string): Promise<NBPExchangeRates> => {
  const response = await fetch(`${RATES_URL}/${table}/${code}/${date}/?format=json`);
  return handleResponse(response);
};