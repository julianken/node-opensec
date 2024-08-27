class Client {
  private apiKey: string;

  constructor() {
    if (!process.env.OPENSECRETS_API_KEY) {
      throw new Error('OPENSECRETS_API_KEY environment variable is required');
    }

    this.apiKey = process.env.OPENSECRETS_API_KEY;
  }

  getLegislators(state: string): Promise<Response> {
    return fetch(`https://www.opensecrets.org/api/?id=${state}&method=getLegislators&output=json&apikey=${process.env.OPENSECRETS_API_KEY}`);
  }
}

export { Client };
