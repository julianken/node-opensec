import { StateAbbreviation } from './types/common';
import { buildOpenSecretsUri } from './util/uri';
import { LegislatorsResponse, Legislator, LegislatorWrapper, GetLegislatorParams } from './types/GetLegislators';
import { CandidateSummaryResponse, CandidateSummary, GetCandidateSummaryParams } from './types/CandSummary';
import { CandidateContributionsResponse, ContributorWrapper, Contributor, GetCandidateContributionsParams } from './types/CandContrib';

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

    const uri: string = buildOpenSecretsUri(uriProps);
    const data: LegislatorsResponse = await this.fetchData<LegislatorsResponse>(uri);

    return data.response.legislator.map((legislator: LegislatorWrapper) => legislator['@attributes']);
  }

  async getCandidateSummary(cid: string, cycle?: string): Promise<CandidateSummary> {
    const uriProps: GetCandidateSummaryParams = {
      cid,
      method: 'candSummary',
      cycle,
      output: 'json',
      apikey: this.apiKey,
    };

    const uri: string = buildOpenSecretsUri(uriProps);
    const data: CandidateSummaryResponse = await this.fetchData<CandidateSummaryResponse>(uri);

    return data.response.summary['@attributes'];
  }

  async getCandidateContributions(cid: string, cycle?: string): Promise<Contributor[]> {
    const uriProps: GetCandidateContributionsParams = {
      cid,
      method: 'candContrib',
      cycle,
      output: 'json',
      apikey: this.apiKey,
    };

    const uri: string = buildOpenSecretsUri(uriProps);
    const data: CandidateContributionsResponse = await this.fetchData<CandidateContributionsResponse>(uri);

    return data.response.contributors.contributor.map((c: ContributorWrapper) => c['@attributes']);
  }

  private async fetchData<T>(uri: string): Promise<T> {
    const response: Response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: T = await response.json();
    return data;
  }
}

export { Client };
