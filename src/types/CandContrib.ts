export interface Contributor {
  org_name: string;
  total: string;
  pacs: string;
  indivs: string;
}

export interface ContributorWrapper {
  "@attributes": Contributor;
}

export interface CandidateContributionsAttributes {
  cand_name: string;
  cid: string;
  cycle: string;
  origin: string;
  source: string;
  notice: string;
}

export interface CandidateContributionsWrapper {
  "@attributes": CandidateContributionsAttributes;
  contributor: ContributorWrapper[];
}

export interface CandidateContributionsResponse {
  response: {
    contributors: CandidateContributionsWrapper;
  };
}

export type GetCandidateContributionsParams = {
  cid: string;
  method: 'candContrib';
  cycle?: string;
  output: 'json';
  apikey: string;
};
