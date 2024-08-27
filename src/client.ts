import { buildOpenSecretsUri } from './util/uri';

class Client {
  private apiKey: string;

  constructor() {
    if (!process.env.OPENSECRETS_API_KEY) {
      throw new Error('OPENSECRETS_API_KEY environment variable is required');
    }

    this.apiKey = process.env.OPENSECRETS_API_KEY;
  }

  getLegislators(state: string): Promise<Response> {
    return fetch(
      buildOpenSecretsUri({
        id: state,
        method: 'getLegislators',
        output: 'json',
        apikey: this.apiKey,
      })
    );
  };
}

export { Client };
