export interface CompanyDetailsDTO {
  id: string;
  symbol: string;
  name: string;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
  marketCap: number | null;
  marketCapFormatted: string | null;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
}
