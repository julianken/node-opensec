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

  async getLegislators(state: StateAbbreviation): Promise<Legislator[]> {
    const uriProps: GetLegislatorParams = {
      id: state,
      method: 'getLegislators',
      output: 'json',
      apikey: this.apiKey,
    };

    const uri: string = buildOpenSecretsUri(uriProps);

    try {
      const response = await fetch(uri);

      if (!response.ok) {
        throw new APIError('Network response was not ok', response.status, await response.json());
      }

      const data: LegislatorsResponse = await response.json();

      if (!data.response || !data.response.legislator) {
        throw new ValidationError('Invalid response format', ['Expected legislator data to be present']);
      }

      return data.response.legislator.map((legislator: LegislatorWrapper) => legislator['@attributes']);
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

  async getCandidateSummary(cid: string, cycle?: string): Promise<CandidateSummary> {
    const uriProps: GetCandidateSummaryParams = {
      cid,
      method: 'candSummary',
      cycle,
      output: 'json',
      apikey: this.apiKey,
    };

    const uri: string = buildOpenSecretsUri(uriProps);

    try {
      const response = await fetch(uri);

      if (!response.ok) {
        throw new APIError('Network response was not ok', response.status, await response.json());
      }

      const data: CandidateSummaryResponse = await response.json();

      if (!data.response || !data.response.summary) {
        throw new ValidationError('Invalid response format', ['Expected summary data to be present']);
      }

      return data.response.summary['@attributes'];
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

  async getCandidateContributions(cid: string, cycle?: string): Promise<Contributor[]> {
    const uriProps: GetCandidateContributionsParams = {
      cid,
      method: 'candContrib',
      cycle,
      output: 'json',
      apikey: this.apiKey,
    };

    const uri: string = buildOpenSecretsUri(uriProps);

    try {
      const response = await fetch(uri);

      if (!response.ok) {
        throw new APIError('Network response was not ok', response.status, await response.json());
      }

      const data: CandidateContributionsResponse = await response.json();

      if (!data.response || !data.response.contributors || !data.response.contributors.contributor) {
        throw new ValidationError('Invalid response format', ['Expected contributors data to be present']);
      }

      return data.response.contributors.contributor.map((c: ContributorWrapper) => c['@attributes']);
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
}

export { Client };
