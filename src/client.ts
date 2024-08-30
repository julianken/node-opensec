import { buildOpenSecretsUri } from './util/uri';
import { Legistlators } from './types/Legislators';

class Client {
  private apiKey: string;

  constructor() {
    if (!process.env.OPENSECRETS_API_KEY) {
      throw new Error('OPENSECRETS_API_KEY environment variable is required');
    }

    this.apiKey = process.env.OPENSECRETS_API_KEY;
  }

  async getLegislators(state: string): Promise<Legistlators> {
    const uri = buildOpenSecretsUri({
      id: state,
      method: 'getLegislators',
      output: 'json',
      apikey: this.apiKey,
    });

    const response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data: Legistlators = await response.json();
    return data;
  }
}

export { Client };
