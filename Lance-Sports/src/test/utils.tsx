import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock data for Google OAuth tests
export const mockGoogleOAuthData = {
  accessToken: 'mock-access-token-123',
  userInfo: {
    sub: 'google-user-id-456',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
  },
  supabaseResponse: {
    data: { id: 'user-789' },
    error: null,
  },
  supabaseError: {
    data: null,
    error: {
      message: 'Database error',
      code: 'DB_ERROR',
    },
  },
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withOAuthProvider?: boolean;
  clientId?: string;
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withRouter = true,
    withOAuthProvider = false,
    clientId = 'test-client-id',
    ...renderOptions
  } = options;

  let Wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  if (withOAuthProvider) {
    Wrapper = ({ children }) => (
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
    );
  }

  if (withRouter) {
    const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    );
    
    const OriginalWrapper = Wrapper;
    Wrapper = ({ children }) => (
      <OriginalWrapper>
        <RouterWrapper>{children}</RouterWrapper>
      </OriginalWrapper>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper function to mock Google OAuth success
export const mockGoogleOAuthSuccess = (mockData = mockGoogleOAuthData) => {
  return {
    access_token: mockData.accessToken,
    userInfo: mockData.userInfo,
    supabaseResponse: mockData.supabaseResponse,
  };
};

// Helper function to mock Google OAuth error
export const mockGoogleOAuthError = (errorMessage = 'OAuth failed') => {
  return new Error(errorMessage);
};

// Helper function to mock network error
export const mockNetworkError = (errorMessage = 'Network error') => {
  return new Error(errorMessage);
};

// Helper function to wait for async operations
export const waitForAsync = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from testing library
export * from '@testing-library/react';
