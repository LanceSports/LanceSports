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

// Mock global fetch
global.fetch = vi.fn();

describe('ChatBot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API response
    mockAskFootyBot.mockResolvedValue('Liverpool is playing well this season!');
    
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

  describe('Initial Render', () => {
    it('should render chatbot interface', () => {
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      expect(screen.getByText('LanceSports AI')).toBeInTheDocument();
      expect(screen.getByText('Always ready to help')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    });

    it('should show initial welcome message', () => {
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      expect(screen.getByText(/Hello! I'm your LanceSports AI assistant/)).toBeInTheDocument();
    });

    it('should display suggested questions initially', () => {
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      expect(screen.getByText('Show me live matches')).toBeInTheDocument();
      expect(screen.getByText('Premier League standings')).toBeInTheDocument();
      expect(screen.getByText('Champions League fixtures')).toBeInTheDocument();
      expect(screen.getByText('How to view match details?')).toBeInTheDocument();
    });
  });

  describe('Message Sending', () => {
    it('should send message when form is submitted', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'How is Liverpool doing?');
      await user.click(sendButton);

      await waitFor(() => {
        expect(mockAskFootyBot).toHaveBeenCalledWith('How is Liverpool doing?');
      });
    });

    it('should send message when Enter key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test message{enter}');

      await waitFor(() => {
        expect(mockAskFootyBot).toHaveBeenCalledWith('Test message');
      });
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.click(sendButton);

      expect(mockAskFootyBot).not.toHaveBeenCalled();
    });

    it('should clear input after sending message', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...') as HTMLInputElement;
      
      await user.type(input, 'Test message');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Message Display', () => {
    it('should display user message after sending', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'How is Liverpool?');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('How is Liverpool?')).toBeInTheDocument();
      });
    });

    it('should display bot response after API call', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'How is Liverpool?');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('Liverpool is playing well this season!')).toBeInTheDocument();
      });
    });

    it('should show typing indicator while waiting for response', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      mockAskFootyBot.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve('Response'), 100)
      ));
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test');
      await user.keyboard('{enter}');

      // Should show typing indicator
      expect(screen.getByText('…')).toBeInTheDocument();
    });
  });

  describe('Suggested Questions', () => {
    it('should send suggested question when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const suggestedQuestion = screen.getByText('Show me live matches');
      await user.click(suggestedQuestion);

      await waitFor(() => {
        expect(mockAskFootyBot).toHaveBeenCalledWith('Show me live matches');
      });
    });

    it('should hide suggested questions after sending first message', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test message');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.queryByText('Show me live matches')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should reset conversation when reset button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      // Send a message first
      const input = screen.getByPlaceholderText('Ask me anything...');
      await user.type(input, 'Test message');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // Reset conversation
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Should show initial welcome message and suggested questions
      expect(screen.getByText(/Hello! I'm your LanceSports AI assistant/)).toBeInTheDocument();
      expect(screen.getByText('Show me live matches')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockRejectedValue(new Error('API Error'));
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test message');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText(/I couldn't reach the LanceSports API/)).toBeInTheDocument();
      });
    });

    it('should disable input while typing', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      mockAskFootyBot.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve('Response'), 100)
      ));
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...') as HTMLInputElement;
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Test');
      await user.keyboard('{enter}');

      // Input and button should be disabled while waiting for response
      expect(input.disabled).toBe(true);
      expect(sendButton.disabled).toBe(true);
    });
  });

  describe('Message Formatting', () => {
    it('should format bold text correctly', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('**Liverpool** is playing well!');
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test');
      await user.keyboard('{enter}');

      await waitFor(() => {
        const boldText = screen.getByText('Liverpool');
        expect(boldText).toHaveClass('text-green-300');
      });
    });

    it('should format bullet points correctly', async () => {
      const user = userEvent.setup();
      
      mockAskFootyBot.mockResolvedValue('• Liverpool\n• Manchester City');
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test');
      await user.keyboard('{enter}');

      await waitFor(() => {
        const bulletPoints = screen.getAllByText(/• /);
        expect(bulletPoints).toHaveLength(2);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      expect(input).toHaveAttribute('placeholder', 'Ask me anything...');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      // Should be able to type and send with keyboard
      await user.type(input, 'Test message');
      await user.keyboard('{enter}');

      expect(mockAskFootyBot).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle multiple rapid messages', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText('Ask me anything...');
      
      // Send multiple messages quickly
      await user.type(input, 'Message 1');
      await user.keyboard('{enter}');
      
      await user.type(input, 'Message 2');
      await user.keyboard('{enter}');
      
      await user.type(input, 'Message 3');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(screen.getByText('Message 1')).toBeInTheDocument();
        expect(screen.getByText('Message 2')).toBeInTheDocument();
        expect(screen.getByText('Message 3')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render on different screen sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      expect(screen.getByText('LanceSports AI')).toBeInTheDocument();
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      
      render(
        <BrowserRouter>
          <ChatBot />
        </BrowserRouter>
      );

      expect(screen.getByText('LanceSports AI')).toBeInTheDocument();
    });
  });
});
