import { buildOpenSecretsUri } from './util/uri';
import { Legislators } from './types/Legislators';
import { OutputFormat } from './types/common';

class Client {
  private apiKey: string;

  constructor() {
    if (!process.env.OPENSECRETS_API_KEY) {
      throw new Error('OPENSECRETS_API_KEY environment variable is required');
    }

    this.apiKey = process.env.OPENSECRETS_API_KEY;
  }

  async getLegislators(state: string, output: OutputFormat = 'json'): Promise<Legislators> {
    const uri = buildOpenSecretsUri({
      id: state,
      method: 'getLegislators',
      output: output,
      apikey: this.apiKey,
    });

    const response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data: Legislators = await response.json();
    return data;
  }
}

export { Client };
