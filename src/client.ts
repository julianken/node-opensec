import { StateAbbreviation } from 'common';
import { buildOpenSecretsUri } from './util/uri';
import { LegislatorsResponse, Legislator } from 'Legislators';

const JSON = 'json';

type GetLegislatorParams = {
  id: StateAbbreviation;
  method: 'getLegislators';
  output: 'json';
  apikey: string;
}

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
      output: JSON,
      apikey: this.apiKey,
    }

    const uri = buildOpenSecretsUri(uriProps);

    const response: Response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: LegislatorsResponse = await response.json();
    return data.response.legislator.map((legislator) => legislator['@attributes']);
  }
}

export { Client };
