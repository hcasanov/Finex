export interface CompanySearchResultDTO {
  symbol: string;
  name: string;
  exchange: string | null;
}

export interface CompanySearchResponseDTO {
  results: CompanySearchResultDTO[];
  query: string;
  count: number;
}
