import { StateAbbreviation } from './types/common';
import { buildOpenSecretsUri } from './util/uri';
import { LegislatorsResponse, Legislator } from './types/Legislators';

type GetLegislatorParams = {
  id: StateAbbreviation;
  method: 'getLegislators';
  output: 'json';
  apikey: string;
};

type GetCandidateSummaryParams = {
  cid: string;
  method: 'candSummary';
  cycle?: string;
  output: 'json';
  apikey: string;
};

type GetCandidateContributionsParams = {
  cid: string;
  method: 'candContrib';
  cycle?: string;
  output: 'json';
  apikey: string;
};

class Client {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 32) {
      throw new Error('A valid 32 character API key is required');
    }
    this.apiKey = apiKey;
  }

  async getLegislators(state: StateAbbreviation): Promise<Legislator[]> {
    const uriProps: GetLegislatorParams = {
      id: state,
      method: 'getLegislators',
      output: 'json',
      apikey: this.apiKey,
    };

    const uri = buildOpenSecretsUri(uriProps);
    const response = await this.fetchData(uri);
    const data: LegislatorsResponse = await response.json();

    return data.response.legislator.map((legislator) => legislator['@attributes']);
  }

  async getCandidateSummary(cid: string, cycle?: string) {
    const uriProps: GetCandidateSummaryParams = {
      cid,
      method: 'candSummary',
      cycle,
      output: 'json',
      apikey: this.apiKey,
    };

    const uri = buildOpenSecretsUri(uriProps);
    const response = await this.fetchData(uri);
    const data = await response.json();

    return data.response.candsummary;
  }

  async getCandidateContributions(cid: string, cycle?: string) {
    const uriProps: GetCandidateContributionsParams = {
      cid,
      method: 'candContrib',
      cycle,
      output: 'json',
      apikey: this.apiKey,
    };

    const uri = buildOpenSecretsUri(uriProps);
    const response = await this.fetchData(uri);
    const data = await response.json();

    return data.response.contributors;
  }

  private async fetchData(uri: string): Promise<Response> {
    const response: Response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response;
  }
}

export { Client };
