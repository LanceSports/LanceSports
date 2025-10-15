import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { askFootyBot } from '../../src/components/lib/footyApi';

// Mock global fetch
global.fetch = vi.fn();

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_BASE: 'https://test-api-base.com'
}));

describe('footyApi Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('askFootyBot Function', () => {
    it('should make successful API call with correct parameters', async () => {
      const mockResponse = {
        reply: 'Liverpool is currently in great form this season!'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot('How is Liverpool performing?');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://lancesports-3kmd.onrender.com/api/football-chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'How is Liverpool performing?' })
        }
      );

      expect(result).toBe('Liverpool is currently in great form this season!');
    });

    it('should use default API base when VITE_API_BASE is not set', async () => {
      // Mock missing environment variable
      vi.doMock('import.meta.env', () => ({}));

      const mockResponse = {
        reply: 'Test response'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      // Re-import to get the module with mocked env
      const { askFootyBot: askFootyBotWithoutEnv } = await import('../../src/components/lib/footyApi');
      
      await askFootyBotWithoutEnv('Test message');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://lancesports-3kmd.onrender.com/api/football-chat'),
        expect.any(Object)
      );
    });

    it('should handle API base URL with trailing slash', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_API_BASE: 'https://test-api-base.com/'
      }));

      const mockResponse = {
        reply: 'Test response'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const { askFootyBot: askFootyBotWithSlash } = await import('../../src/components/lib/footyApi');
      
      await askFootyBotWithSlash('Test message');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://lancesports-3kmd.onrender.com/api/football-chat',
        expect.any(Object)
      );
    });

    it('should handle different types of football questions', async () => {
      const testCases = [
        { question: 'Show me live matches', expectedReply: 'Here are the current live matches...' },
        { question: 'Premier League standings', expectedReply: 'Current Premier League standings...' },
        { question: 'Champions League fixtures', expectedReply: 'Upcoming Champions League fixtures...' },
        { question: 'How to view match details?', expectedReply: 'To view match details...' }
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          reply: testCase.expectedReply
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          text: async () => JSON.stringify(mockResponse)
        });

        const result = await askFootyBot(testCase.question);

        expect(result).toBe(testCase.expectedReply);
      }
    });

    it('should handle special characters in messages', async () => {
      const specialMessage = 'What\'s the score for "Liverpool vs Arsenal" (Premier League)?';
      const mockResponse = {
        reply: 'Liverpool vs Arsenal ended 2-1'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot(specialMessage);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/football-chat'),
        expect.objectContaining({
          body: JSON.stringify({ message: specialMessage })
        })
      );

      expect(result).toBe('Liverpool vs Arsenal ended 2-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(askFootyBot('Test message')).rejects.toThrow('Network error');
    });

    it('should handle 404 responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Endpoint not found'
      });

      await expect(askFootyBot('Test message')).rejects.toThrow('API 404');
    });

    it('should handle 500 responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      await expect(askFootyBot('Test message')).rejects.toThrow('API 500');
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => 'invalid json'
      });

      const result = await askFootyBot('Test message');
      expect(result).toBe('Sorry, I couldn\'t generate a reply.');
    });

    it('should handle empty responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        text: async () => '{}'
      });

      const result = await askFootyBot('Test message');
      expect(result).toBe('Sorry, I couldn\'t generate a reply.');
    });

    it('should handle responses without reply field', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Wrong field' }),
        text: async () => '{"message": "Wrong field"}'
      });

      const result = await askFootyBot('Test message');
      expect(result).toBe('Sorry, I couldn\'t generate a reply.');
    });

    it('should handle timeout errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('timeout'));

      await expect(askFootyBot('Test message')).rejects.toThrow('timeout');
    });

    it('should handle CORS errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('CORS error'));

      await expect(askFootyBot('Test message')).rejects.toThrow('CORS error');
    });
  });

  describe('Response Formatting', () => {
    it('should handle markdown formatting in responses', async () => {
      const mockResponse = {
        reply: '**Liverpool** is playing well!\n\n• Premier League: 1st place\n• Goals: 45'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot('How is Liverpool?');
      expect(result).toBe(mockResponse.reply);
    });

    it('should handle long responses', async () => {
      const longReply = 'A'.repeat(1000) + ' - This is a very long response';
      const mockResponse = {
        reply: longReply
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot('Tell me about football history');
      expect(result).toBe(longReply);
      expect(result.length).toBe(1031);
    });

    it('should handle responses with emojis', async () => {
      const mockResponse = {
        reply: '⚽ Liverpool vs Arsenal 🏆 - Final score: 2-1 ⭐'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot('Match result?');
      expect(result).toBe('⚽ Liverpool vs Arsenal 🏆 - Final score: 2-1 ⭐');
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      const mockResponse = {
        reply: 'Test response'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const startTime = performance.now();

      const promises = Array.from({ length: 10 }, (_, i) => 
        askFootyBot(`Test message ${i}`)
      );

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(results.every(result => result === 'Test response')).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle rapid sequential requests', async () => {
      const mockResponse = {
        reply: 'Test response'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const startTime = performance.now();

      for (let i = 0; i < 5; i++) {
        await askFootyBot(`Test message ${i}`);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(global.fetch).toHaveBeenCalledTimes(5);
      expect(executionTime).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  describe('Security', () => {
    it('should handle malicious input safely', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const mockResponse = {
        reply: 'I cannot process that request.'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot(maliciousInput);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/football-chat'),
        expect.objectContaining({
          body: JSON.stringify({ message: maliciousInput })
        })
      );

      expect(result).toBe('I cannot process that request.');
    });

    it('should handle SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const mockResponse = {
        reply: 'Invalid request format.'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot(sqlInjection);
      expect(result).toBe('Invalid request format.');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limit exceeded'
      });

      await expect(askFootyBot('Test message')).rejects.toThrow('API 429');
    });

    it('should handle rate limit with retry-after header', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: (name: string) => name === 'retry-after' ? '60' : null
        },
        text: async () => 'Rate limit exceeded. Try again in 60 seconds.'
      });

      await expect(askFootyBot('Test message')).rejects.toThrow('API 429');
    });
  });

  describe('Data Validation', () => {
    it('should validate message parameter', async () => {
      await expect(askFootyBot('')).rejects.toThrow();
      await expect(askFootyBot(null as any)).rejects.toThrow();
      await expect(askFootyBot(undefined as any)).rejects.toThrow();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(10000);
      const mockResponse = {
        reply: 'Message too long'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot(longMessage);
      expect(result).toBe('Message too long');
    });

    it('should handle messages with only whitespace', async () => {
      const whitespaceMessage = '   \n\t   ';
      const mockResponse = {
        reply: 'Please provide a valid question.'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await askFootyBot(whitespaceMessage);
      expect(result).toBe('Please provide a valid question.');
    });
  });
});
