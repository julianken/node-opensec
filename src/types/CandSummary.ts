export interface CandidateSummary {
  cand_name: string;
  cid: string;
  cycle: string;
  state: string;
  party: string;
  chamber: string;
  first_elected: string;
  next_election: string;
  total: string;
  spent: string;
  cash_on_hand: string;
  debt: string;
  origin: string;
  source: string;
  last_updated: string;
}

export interface CandidateSummaryWrapper {
  "@attributes": CandidateSummary;
}

export interface CandidateSummaryResponse {
  response: {
    summary: CandidateSummaryWrapper;
  };
}

export type GetCandidateSummaryParams = {
  cid: string;
  method: 'candSummary';
  cycle?: string;
  output: 'json';
  apikey: string;
};
