import fetchMock from 'jest-fetch-mock';
import { Client } from './client';
import { legislatorsMock } from './spec/fixtures/mocks/legislators';
import getLegislators from './spec/fixtures/getLegislators.json';
import candSummary from './spec/fixtures/candSummary.json';
import candContrib from './spec/fixtures/candContrib.json';
import { StateAbbreviation } from './types/common';

fetchMock.enableMocks();

describe('OpenSecrets API Client', () => {
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

  describe('Client Initialization', () => {
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

  describe('Request Handling', () => {
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

  describe('Error Handling', () => {
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

  describe('Additional Scenarios', () => {
    it('should handle multiple consecutive requests', async () => {
      fetchMock.mockResponse(JSON.stringify(getLegislators));

      const state1 = 'CA';
      const state2 = 'NY';

      const legislators1 = await client.getLegislators(state1 as StateAbbreviation);
      const legislators2 = await client.getLegislators(state2 as StateAbbreviation);

      expect(legislators1).toEqual(legislatorsMock);
      expect(legislators2).toEqual(legislatorsMock);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array if the response has no legislators', async () => {
      const emptyResponse = { response: { legislator: [] } };
      fetchMock.mockResponseOnce(JSON.stringify(emptyResponse));

      const state = 'CA';
      const legislators = await client.getLegislators(state as StateAbbreviation);

      expect(legislators).toEqual([]);
    });

    it('should handle large responses efficiently for candidate summaries', async () => {
      const largeResponse = {
        response: {
          summary: {
            '@attributes': {
              cand_name: 'Kiley, Kevin',
              cid: 'N00050259',
              cycle: '2022',
              total: '3190567.92',
              spent: '3151594.43',
              cash_on_hand: '38973.49',
              debt: '68518.2',
              source: 'OpenSecrets.org',
              last_updated: '12/31/2022',
            },
          },
        },
      };
      fetchMock.mockResponseOnce(JSON.stringify(largeResponse));

      const candidateCid = 'N00050259';
      const summary = await client.getCandidateSummary(candidateCid, '2022');

      expect(summary).toEqual(largeResponse.response.summary['@attributes']);
    });

    it('should handle large responses efficiently for candidate contributions', async () => {
      const largeResponse = {
        response: {
          contributors: {
            contributor: new Array(1000).fill({
              '@attributes': {
                org_name: 'Allworth Financial',
                total: '17000',
                pacs: '0',
                indivs: '17000',
              },
            }),
          },
        },
      };
      fetchMock.mockResponseOnce(JSON.stringify(largeResponse));

      const candidateCid = 'N00050259';
      const contributions = await client.getCandidateContributions(candidateCid, '2022');

      const parsedContributions = largeResponse.response.contributors.contributor.map(c => c['@attributes']);

      expect(contributions).toHaveLength(1000);
      expect(contributions).toEqual(parsedContributions);
    });
  });
});
