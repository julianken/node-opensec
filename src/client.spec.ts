import fetchMock from 'jest-fetch-mock';
import { Client } from './client';
import { legislatorsMock } from './spec/fixtures/mocks/legislators';
import getLegislators from './spec/fixtures/getLegislators.json';
import { StateAbbreviation } from './types/common';

fetchMock.enableMocks();

describe('Client', () => {
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

  describe('Initialization', () => {
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

    it('should return an empty array if the response has no legislators', async () => {
      const emptyResponse = { response: { legislator: [] } };
      fetchMock.mockResponseOnce(JSON.stringify(emptyResponse));

      const state = 'CA';
      const legislators = await client.getLegislators(state as StateAbbreviation);

      expect(legislators).toEqual([]);
    });

    it('should throw an error if the network request fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network Error'));

      const state = 'CA';

      await expect(client.getLegislators(state as StateAbbreviation)).rejects.toThrow('Network Error');
    });

    it('should throw an error if the API key is incorrect', async () => {
      fetchMock.mockResponseOnce('', { status: 403 });

      const state = 'CA';

      await expect(client.getLegislators(state as StateAbbreviation)).rejects.toThrow('Network response was not ok');
    });

    it('should handle large responses efficiently', async () => {
      const largeResponse = {
        response: { legislator: new Array(1000).fill(getLegislators.response.legislator[0]) },
      };
      fetchMock.mockResponseOnce(JSON.stringify(largeResponse));

      const state = 'CA';
      const legislators = await client.getLegislators(state as StateAbbreviation);

      expect(legislators).toHaveLength(1000);
    });

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

    it('should handle invalid state abbreviations gracefully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ response: { legislator: [] } }));
    
      const invalidState = 'XX' as StateAbbreviation;
      const legislators = await client.getLegislators(invalidState);
    
      expect(legislators).toEqual([]);
    });
  });

  describe('getCandidateSummary', () => {
    it('should allow fetching candidate summaries for legislators', async () => {
      const candidateCid = 'N00033987'; // Example CID
      
      fetchMock.mockResponseOnce(
        JSON.stringify({
          response: {
            candsummary: {
              cand_name: 'Pelosi, Nancy',
              cid: candidateCid,
              cycle: '2022',
              total: 2000000,
              spent: 1500000,
              cash_on_hand: 500000,
              debt: 0,
              source: 'OpenSecrets.org',
              last_updated: '09/01/2023',
            },
          },
        })
      );

      const summary = await client.getCandidateSummary(candidateCid, '2022');
      
      expect(summary).toEqual({
        cand_name: 'Pelosi, Nancy',
        cid: candidateCid,
        cycle: '2022',
        total: 2000000,
        spent: 1500000,
        cash_on_hand: 500000,
        debt: 0,
        source: 'OpenSecrets.org',
        last_updated: '09/01/2023',
      });      
    });

    it('should handle network errors during candidate summary fetching', async () => {
      const candidateCid = 'N00000000';
  
      fetchMock.mockRejectOnce(new Error('Network Error'));
  
      await expect(client.getCandidateSummary(candidateCid, '2022')).rejects.toThrow('Network Error');
    });
  });

  describe('getCandidateContributions', () => {
    it('should allow fetching candidate contributions', async () => {
      const candidateCid = 'N00007360'; // Example CID
      
      fetchMock.mockResponseOnce(
        JSON.stringify({
          response: {
            contributors: [
              {
                org_name: 'Alphabet Inc',
                total: 500000,
                pacs: 250000,
                indivs: 250000,
              },
              {
                org_name: 'Microsoft Corp',
                total: 400000,
                pacs: 200000,
                indivs: 200000,
              },
            ],
          },
        })
      );
    
      const contributions = await client.getCandidateContributions(candidateCid, '2022');
      
      expect(contributions).toEqual([
        {
          org_name: 'Alphabet Inc',
          total: 500000,
          pacs: 250000,
          indivs: 250000,
        },
        {
          org_name: 'Microsoft Corp',
          total: 400000,
          pacs: 200000,
          indivs: 200000,
        },
      ]);
    });
    
    it('should handle network errors during candidate contributions fetching', async () => {
      const candidateCid = 'N00000000';
  
      fetchMock.mockRejectOnce(new Error('Network Error'));
  
      await expect(client.getCandidateContributions(candidateCid, '2022')).rejects.toThrow('Network Error');
    });
  });

  describe('Error Handling', () => {
    it('should throw an error for invalid response formats', async () => {
      fetchMock.mockResponseOnce('Invalid Response');
  
      const state = 'CA';
  
      await expect(client.getLegislators(state as StateAbbreviation)).rejects.toThrow();
    });
  });
});
