import { StateAbbreviation } from './common';

export interface Legislator {
  cid: string;
  firstlast: string;
  lastname: string;
  party: string;
  office: string;
  gender: string;
  firstelectoff: string;
  exitcode: string;
  comments: string;
  phone: string;
  fax: string;
  website: string;
  webform: string;
  congress_office: string;
  bioguide_id: string;
  votesmart_id: string;
  feccandid: string;
  twitter_id: string;
  youtube_url: string;
  facebook_id: string;
  birthdate: string;
}

export interface LegislatorWrapper {
  "@attributes": Legislator;
}

export interface LegislatorsResponse {
  response: {
    legislator: LegislatorWrapper[];
  };
}

export type GetLegislatorParams = {
  id: StateAbbreviation;
  method: 'getLegislators';
  output: 'json';
  apikey: string;
};
