import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ChatBot } from '../../src/components/ChatBot';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the askFootyBot function
const mockAskFootyBot = vi.fn();
vi.mock('../../src/components/lib/footyApi', () => ({
  askFootyBot: (message: string) => mockAskFootyBot(message)
}));

describe('ChatBot End-to-End Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Chat Session Flow', () => {
    it('should handle a complete conversation from start to finish', async () => {
      const user = userEvent.setup();
      
      // Mock API responses for a conversation
      mockAskFootyBot
        .mockResolvedValueOnce('Here are the current live matches: Liverpool vs Arsenal (2-1), Manchester City vs Chelsea (0-0)')
        .mockResolvedValueOnce('Liverpool is currently 1st in the Premier League with 65 points from 27 matches.')
        .mockResolvedValueOnce('The next Champions League matches are: Real Madrid vs Bayern Munich, Barcelona vs Liverpool');

      render(<ChatBot />);

      // Initial state - should see welcome message and suggested questions
      expect(screen.getByText(/Hello! I'm your LanceSports AI assistant/)).toBeInTheDocument();
      expect(screen.getByText('Show me live matches')).toBeInTheDocument();

      // Start conversation by clicking suggested question
      const liveMatchesButton = screen.getByText('Show me live matches');
      await user.click(liveMatchesButton);

      // Should show user message and bot response
      await waitFor(() => {
        expect(screen.getByText('Show me live matches')).toBeInTheDocument();
        expect(screen.getByText('Here are the current live matches: Liverpool vs Arsenal (2-1), Manchester City vs Chelsea (0-0)')).toBeInTheDocument();
      });

      // Suggested questions should be hidden after first message
      expect(screen.queryByText('Show me live matches')).not.toBeInTheDocument();

      // Ask follow-up question
      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'How is Liverpool doing in the Premier League?');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('How is Liverpool doing in the Premier League?')).toBeInTheDocument();
        expect(screen.getByText('Liverpool is currently 1st in the Premier League with 65 points from 27 matches.')).toBeInTheDocument();
      });

      // Ask another question
      await user.type(input, 'What about Champions League?');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('What about Champions League?')).toBeInTheDocument();
        expect(screen.getByText('The next Champions League matches are: Real Madrid vs Bayern Munich, Barcelona vs Liverpool')).toBeInTheDocument();
      });

      // Should have 3 user messages and 3 bot responses (plus initial welcome)
      const userMessages = screen.getAllByText(/Show me live matches|How is Liverpool doing|What about Champions League/);
      const botMessages = screen.getAllByText(/Here are the current live matches|Liverpool is currently 1st|The next Champions League matches/);
      
      expect(userMessages).toHaveLength(3);
      expect(botMessages).toHaveLength(3);
    });

    it('should handle conversation reset and start fresh', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('Test response');

      render(<ChatBot />);

      // Start a conversation
      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Test message');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // Reset conversation
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Should be back to initial state
      expect(screen.getByText(/Hello! I'm your LanceSports AI assistant/)).toBeInTheDocument();
      expect(screen.getByText('Show me live matches')).toBeInTheDocument();
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('should handle navigation back to previous page', async () => {
      const user = userEvent.setup();
      
      render(<ChatBot />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle API errors and allow retry', async () => {
      const user = userEvent.setup();
      
      // Mock API error first, then success
      mockAskFootyBot
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce('Success response');

      render(<ChatBot />);

      // Ask a question that will fail
      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Test question');
      await user.keyboard('{enter}');

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/I couldn't reach the LanceSports API/)).toBeInTheDocument();
      });

      // Ask another question that should succeed
      await user.type(input, 'Another question');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('Another question')).toBeInTheDocument();
        expect(screen.getByText('Success response')).toBeInTheDocument();
      });
    });

    it('should handle network timeouts gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock timeout error
      mockAskFootyBot.mockRejectedValue(new Error('timeout'));

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Test question');
      await user.keyboard('{enter}');

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/I couldn't reach the LanceSports API/)).toBeInTheDocument();
      });

      // Input should be re-enabled
      expect(input).not.toBeDisabled();
    });
  });

  describe('Message Formatting Flow', () => {
    it('should properly format markdown in responses', async () => {
      const user = userEvent.setup();
      
      const markdownResponse = '**Liverpool** is playing well!\n\n• Premier League: 1st place\n• Goals: 45';
      mockAskFootyBot.mockResolvedValue(markdownResponse);

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'How is Liverpool?');
      await user.keyboard('{enter}');

      await waitFor(() => {
        // Check for formatted elements
        const boldText = screen.getByText('Liverpool');
        expect(boldText).toHaveClass('text-green-300');
        
        const bulletPoints = screen.getAllByText(/• /);
        expect(bulletPoints).toHaveLength(2);
      });
    });

    it('should handle long responses with proper scrolling', async () => {
      const user = userEvent.setup();
      
      const longResponse = 'A'.repeat(2000) + ' - This is a very long response that should trigger scrolling';
      mockAskFootyBot.mockResolvedValue(longResponse);

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Tell me everything');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText(longResponse)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation Flow', () => {
    it('should handle empty messages gracefully', async () => {
      const user = userEvent.setup();
      
      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Try to send empty message
      await user.click(sendButton);

      // Should not make API call
      expect(mockAskFootyBot).not.toHaveBeenCalled();

      // Try to send message with only whitespace
      await user.type(input, '   ');
      await user.click(sendButton);

      expect(mockAskFootyBot).not.toHaveBeenCalled();
    });

    it('should handle very long messages', async () => {
      const user = userEvent.setup();
      
      const longMessage = 'A'.repeat(5000);
      mockAskFootyBot.mockResolvedValue('Response to long message');

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, longMessage);
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText(longMessage)).toBeInTheDocument();
        expect(screen.getByText('Response to long message')).toBeInTheDocument();
      });
    });

    it('should handle special characters in messages', async () => {
      const user = userEvent.setup();
      
      const specialMessage = 'What\'s the score for "Liverpool vs Arsenal" (Premier League)?';
      mockAskFootyBot.mockResolvedValue('Liverpool won 2-1');

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, specialMessage);
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText(specialMessage)).toBeInTheDocument();
        expect(screen.getByText('Liverpool won 2-1')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Flow', () => {
    it('should handle rapid message sending', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('Quick response');

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');

      // Send multiple messages rapidly
      const startTime = performance.now();

      for (let i = 0; i < 5; i++) {
        await user.type(input, `Message ${i}`);
        await user.keyboard('{enter}');
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should handle rapid sending efficiently
      expect(executionTime).toBeLessThan(2000);

      await waitFor(() => {
        expect(screen.getByText('Message 4')).toBeInTheDocument();
      });
    });

    it('should handle concurrent message processing', async () => {
      const user = userEvent.setup();
      
      // Mock delayed responses
      mockAskFootyBot.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve('Delayed response'), 100)
        )
      );

      render(<ChatBot />);

      const input = screen.getByPlaceholderText('Ask me anything...');

      // Send multiple messages before first response
      await user.type(input, 'First message');
      await user.keyboard('{enter}');

      await user.type(input, 'Second message');
      await user.keyboard('{enter}');

      await user.type(input, 'Third message');
      await user.keyboard('{enter}');

      // All messages should be processed
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.getByText('Third message')).toBeInTheDocument();
      });

      // All responses should appear
      await waitFor(() => {
        const responses = screen.getAllByText('Delayed response');
        expect(responses).toHaveLength(3);
      });
    });
  });

  describe('Accessibility Flow', () => {
    it('should support keyboard-only navigation', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('Keyboard response');

      render(<ChatBot />);

      // Tab to input
      await user.tab();
      const input = screen.getByPlaceholderText('Ask me anything...');
      expect(input).toHaveFocus();

      // Type and send with keyboard
      await user.type(input, 'Keyboard test');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('Keyboard test')).toBeInTheDocument();
        expect(screen.getByText('Keyboard response')).toBeInTheDocument();
      });
    });

    it('should support screen reader navigation', () => {
      render(<ChatBot />);

      // Should have proper ARIA labels
      const input = screen.getByPlaceholderText('Ask me anything...');
      expect(input).toHaveAttribute('placeholder', 'Ask me anything...');

      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /reset/i });
      expect(resetButton).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Mobile Flow', () => {
    it('should work properly on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });

      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('Mobile response');

      render(<ChatBot />);

      // Should render without errors
      expect(screen.getByText('LanceSports AI')).toBeInTheDocument();

      // Should be able to send messages
      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Mobile test');
      await user.keyboard('{enter}');

      // Wait for user message to appear
      await waitFor(() => {
        expect(screen.getByText('Mobile test')).toBeInTheDocument();
      });

      // Wait for API response
      await waitFor(() => {
        expect(screen.getByText('Mobile response')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Session Persistence Flow', () => {
    it('should maintain conversation state across component re-renders', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('Persistent response');

      const { rerender } = render(<ChatBot />);

      // Start conversation
      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Persistent message');
      await user.keyboard('{enter}');

      // Wait for user message to appear
      await waitFor(() => {
        expect(screen.getByText('Persistent message')).toBeInTheDocument();
      });

      // Wait for API response
      await waitFor(() => {
        expect(screen.getByText('Persistent response')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Re-render component
      rerender(<ChatBot />);

      // Conversation should still be there
      expect(screen.getByText('Persistent message')).toBeInTheDocument();
    });
  });
});
