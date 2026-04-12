export interface NBPRate {
  no: string;
  effectiveDate: string;
  mid: number;
}

export interface NBPTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: {
    currency: string;
    code: string;
    mid: number;
  }[];
}

export interface NBPExchangeRates {
  table: string;
  currency: string;
  code: string;
  rates: NBPRate[];
}