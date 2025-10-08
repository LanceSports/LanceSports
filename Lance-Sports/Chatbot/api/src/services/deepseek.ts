import axios from 'axios';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: DeepSeekMessage[], model = 'deepseek-chat'): Promise<string> {
    try {
      const response = await axios.post<DeepSeekResponse>(
        this.baseUrl,
        {
          model,
          messages,
          temperature: 0.3,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content ?? 'No response generated';
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('Failed to get response from DeepSeek');
    }
  }
}
