import { StateAbbreviation } from './types/common';
import { buildOpenSecretsUri } from './util/uri';
import { LegislatorsResponse, Legislator, LegislatorWrapper, GetLegislatorParams } from './types/GetLegislators';
import { CandidateSummaryResponse, CandidateSummary, GetCandidateSummaryParams } from './types/CandSummary';
import { CandidateContributionsResponse, ContributorWrapper, Contributor, GetCandidateContributionsParams } from './types/CandContrib';
import { OpenSecretsError, NetworkError, APIError, ValidationError } from './types/errors';

class Client {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 32) {
      throw new Error('A valid 32 character API key is required');
    }
    this.apiKey = apiKey;
  }

  private async fetchData<T>(uriProps: Record<string, string>, validationFn: (data: T) => boolean, errorMsg: string): Promise<T> {
    const uri: string = buildOpenSecretsUri(uriProps);

    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new APIError('Network response was not ok', response.status, await response.json());
      }

      const data: T = await response.json();
      if (!validationFn(data)) {
        throw new ValidationError('Invalid response format', [errorMsg]);
      }

      return data;
    } catch (error) {
      if (error instanceof OpenSecretsError) {
        throw error;
      } else if (error instanceof Error && error.message === 'Network Error') {
        throw new NetworkError('Network Error', uri);
      } else {
        throw new APIError('Network response was not ok', 500, null);
      }
    }
  }

  async getLegislators(state: StateAbbreviation): Promise<Legislator[]> {
    const uriProps: GetLegislatorParams = {
      id: state,
      method: 'getLegislators',
      output: 'json',
      apikey: this.apiKey,
    };

    const validationFn = (data: LegislatorsResponse) =>
      !!data.response && !!data.response.legislator;

    const data = await this.fetchData<LegislatorsResponse>(
      uriProps,
      validationFn,
      'Expected legislator data to be present'
    );

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

    const validationFn = (data: CandidateSummaryResponse) =>
      !!data.response && !!data.response.summary;

    const data = await this.fetchData<CandidateSummaryResponse>(
      uriProps,
      validationFn,
      'Expected summary data to be present'
    );

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

    const validationFn = (data: CandidateContributionsResponse) =>
      !!data.response && !!data.response.contributors && !!data.response.contributors.contributor;

    const data = await this.fetchData<CandidateContributionsResponse>(
      uriProps,
      validationFn,
      'Expected contributors data to be present'
    );

    return data.response.contributors.contributor.map((c: ContributorWrapper) => c['@attributes']);
  }
}

export { Client };
