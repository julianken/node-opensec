import { Client } from './client';
import { faker } from '@faker-js/faker';
import getLegislators from './spec/fixtures/getLegislators.json';
import { legislatorsMock } from './spec/fixtures/mocks/legislators';

describe('Client', () => {
  let client: Client;
  let apiKey: string;

  beforeEach(() => {
    jest.resetModules();  // Reset modules before each test case
    apiKey = faker.string.alphanumeric({ length: 32 });
    process.env.OPENSECRETS_API_KEY = apiKey;
    client = new Client();
  });

  afterEach(() => {
    delete process.env.OPENSECRETS_API_KEY;
    jest.restoreAllMocks();
  });

  // Initialization Tests
  it('should throw an error if OPENSECRETS_API_KEY is not set', () => {
    delete process.env.OPENSECRETS_API_KEY;
    expect(() => new Client()).toThrow('OPENSECRETS_API_KEY environment variable is required');
  });

  it('should initialize client if OPENSECRETS_API_KEY is set', () => {
    expect(client).toBeInstanceOf(Client);
  });

  // API Interaction Tests
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

    mockFetch.mockRestore();
  });

  it('should correctly parse the JSON response', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(getLegislators),
    } as unknown as Response);

    const state = faker.location.state({ abbreviated: true });
    const legislators = await client.getLegislators(state);

    expect(legislators).toEqual(legislatorsMock);

    mockFetch.mockRestore();
  });

  // Error Handling Tests
  it('should throw an error if the network request fails', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
    } as unknown as Response);

    const state = faker.location.state({ abbreviated: true });

    await expect(client.getLegislators(state)).rejects.toThrow('Network response was not ok');

    mockFetch.mockRestore();
  });

  it('should handle an empty legislator list in the response', async () => {
    const emptyResponse = { response: { legislator: [] } };
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(emptyResponse),
    } as unknown as Response);

    const state = faker.location.state({ abbreviated: true });
    const legislators = await client.getLegislators(state);

    expect(legislators).toEqual([]);

    mockFetch.mockRestore();
  });

  it('should handle an incorrect API key', async () => {
    const errorMessage = 'Invalid API key';
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: errorMessage }),
    } as unknown as Response);

    const state = faker.location.state({ abbreviated: true });

    await expect(client.getLegislators(state)).rejects.toThrow('Network response was not ok');

    mockFetch.mockRestore();
  });

  // Edge Case Tests
  it('should handle multiple consecutive requests', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(getLegislators),
    } as unknown as Response);

    const state1 = faker.location.state({ abbreviated: true });
    const state2 = faker.location.state({ abbreviated: true });

    const legislators1 = await client.getLegislators(state1);
    const legislators2 = await client.getLegislators(state2);

    expect(legislators1).toEqual(legislatorsMock);
    expect(legislators2).toEqual(legislatorsMock);

    expect(mockFetch).toHaveBeenCalledTimes(2);

    mockFetch.mockRestore();
  });

  it('should handle large responses efficiently', async () => {
    const largeResponse = {
      response: { legislator: new Array(1000).fill(getLegislators.response.legislator[0]) },
    };
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(largeResponse),
    } as unknown as Response);

    const state = faker.location.state({ abbreviated: true });
    const legislators = await client.getLegislators(state);

    expect(legislators).toHaveLength(1000);
    mockFetch.mockRestore();
  });
});
