import { Client } from './client';
import { faker } from '@faker-js/faker';
import getLegislators from './spec/fixtures/getLegislators.json';

describe('Client', () => {
  let client: Client;
  let apiKey: string;

  beforeEach(() => {
    jest.resetModules();
    apiKey = faker.string.alphanumeric({ length: 32 });
    process.env.OPENSECRETS_API_KEY = apiKey;
    client = new Client();
  });

  afterEach(() => {
    delete process.env.OPENSECRETS_API_KEY;
    jest.restoreAllMocks();
  });

  it('should throw an error if OPENSECRETS_API_KEY is not set', () => {
    delete process.env.OPENSECRETS_API_KEY;
    expect(() => new Client()).toThrow('OPENSECRETS_API_KEY environment variable is required');
  });

  it('should initialize client if OPENSECRETS_API_KEY is set', () => {
    expect(client).toBeInstanceOf(Client);
  });

  it('should make a request to the correct URL when fetching legislators', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(getLegislators),
    } as unknown as Response);

    const state = faker.location.state({ abbreviated: true });
    await client.getLegislators(state);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://www.opensecrets.org/api/?id=${state}&method=getLegislators&output=json&apikey=${apiKey}`
    );
  });
});
