import fetchMock from 'jest-fetch-mock';
import { Client } from './client';
import { legislatorsMock } from './spec/fixtures/mocks/legislators';
import getLegislators from './spec/fixtures/getLegislators.json';
import candSummary from './spec/fixtures/candSummary.json';
import candContrib from './spec/fixtures/candContrib.json';
import { StateAbbreviation } from './types/common';

fetchMock.enableMocks();

describe('Client()', () => {
  let client: Client;
  let apiKey: string;

  beforeEach(() => {
    apiKey = '12345678901234567890123456789012'; // Mock 32-character API key
    client = new Client(apiKey);
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('client', () => {
    it('should throw an error if the API key is not provided', () => {
      expect(() => new Client('')).toThrow('A valid 32 character API key is required');
    });

    it('should initialize client with the provided API key', () => {
      expect(client).toBeInstanceOf(Client);
      expect(client).toHaveProperty('apiKey', apiKey);
    });

    it('should ensure the API key is always included in the request', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(getLegislators));

      const state = 'CA';
      await client.getLegislators(state as StateAbbreviation);

      const requestUrl = fetchMock.mock.calls[0][0] as string;
      expect(requestUrl).toContain(`apikey=${apiKey}`);
    });
  });

  describe('methods', () => {
    describe('getLegislators', () => {
      it('should make a request to the correct URL when fetching legislators', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(getLegislators));

        const state = 'CA';
        await client.getLegislators(state as StateAbbreviation);

        expect(fetchMock).toHaveBeenCalledWith(
          `https://www.opensecrets.org/api/?id=CA&method=getLegislators&output=json&apikey=${apiKey}`
        );
      });

      it('should correctly parse the JSON response and return a list of legislators', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(getLegislators));

        const state = 'CA';
        const legislators = await client.getLegislators(state as StateAbbreviation);

        expect(legislators).toEqual(legislatorsMock);
      });
    });

    describe('getCandidateSummary', () => {
      it('should make a request to the correct URL when fetching candidate summary', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(candSummary));

        const candidateCid = 'N00050259';
        await client.getCandidateSummary(candidateCid, '2022');

        expect(fetchMock).toHaveBeenCalledWith(
          `https://www.opensecrets.org/api/?cid=N00050259&method=candSummary&cycle=2022&output=json&apikey=${apiKey}`
        );
      });

      it('should correctly parse the JSON response and return the candidate summary', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(candSummary));

        const candidateCid = 'N00050259';
        const summary = await client.getCandidateSummary(candidateCid, '2022');

        expect(summary).toEqual(candSummary.response.summary['@attributes']);
      });
    });

    describe('getCandidateContributions', () => {
      it('should make a request to the correct URL when fetching candidate contributions', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(candContrib));

        const candidateCid = 'N00050259';
        await client.getCandidateContributions(candidateCid, '2022');

        expect(fetchMock).toHaveBeenCalledWith(
          `https://www.opensecrets.org/api/?cid=N00050259&method=candContrib&cycle=2022&output=json&apikey=${apiKey}`
        );
      });

      it('should correctly parse the JSON response and return the list of contributions', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(candContrib));

        const candidateCid = 'N00050259';
        const contributions = await client.getCandidateContributions(candidateCid, '2022');

        const parsedContributions = candContrib.response.contributors.contributor.map(c => c['@attributes']);

        expect(contributions).toEqual(parsedContributions);
      });
    });
  });

  describe('error handling', () => {
    it('should throw an error for network request failures', async () => {
      fetchMock.mockRejectOnce(new Error('Network Error'));

      const state = 'CA';
      await expect(client.getLegislators(state as StateAbbreviation)).rejects.toThrow('Network Error');
    });

    it('should throw an error if the API key is incorrect', async () => {
      fetchMock.mockResponseOnce('', { status: 403 });

      const state = 'CA';
      await expect(client.getLegislators(state as StateAbbreviation)).rejects.toThrow('Network response was not ok');
    });

    it('should throw an error for invalid response formats', async () => {
      fetchMock.mockResponseOnce('Invalid Response');

      const state = 'CA';
      await expect(client.getLegislators(state as StateAbbreviation)).rejects.toThrow();
    });

    it('should handle invalid state abbreviations gracefully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ response: { legislator: [] } }));
    
      const invalidState = 'XX' as StateAbbreviation;
      const legislators = await client.getLegislators(invalidState);
    
      expect(legislators).toEqual([]);
    });

    it('should handle invalid candidate CIDs gracefully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ response: { summary: {} } }));

      const invalidCid = 'N00000000';
      const summary = await client.getCandidateSummary(invalidCid);

      expect(summary).toBeUndefined();
    });
  });
});
