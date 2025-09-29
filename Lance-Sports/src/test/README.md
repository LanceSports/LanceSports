# Test Directory - LanceSports

This directory contains the testing infrastructure for the LanceSports application.

## 📁 Directory Structure

```
src/test/
├── README.md           # This file
├── setup.ts            # Test environment setup and mocks
└── utils.tsx           # Test utilities and helper functions
```
# ===== 29 SEPTEMBER 2025 TESTING INOF THAT CAN BE USED FOR THE DOCU SITE  ============
# Test Suite Overview

## Summary
- **Framework:** Vitest  
- **Total files:** 15  
- **Total tests:** 45  
- **Results:** 31 passing, 14 failing  
- **Runtime:** ~70 seconds  

---

## Passing Areas
- **Accessibility:** `a11y.roles.test.tsx` validates role-based rendering and passes, supporting baseline accessibility compliance.  
- **UI Components:** Core components such as `HeaderBar`, `fixturesSidebar`, and `navbar.smoke` consistently render and behave as expected.  
- **Rendering Logic:** `LiveUpcomingPastMatches` and `main.test.tsx` confirm that essential application pages mount reliably.  
- **Cache Layer:** `cache.test.ts` ensures caching logic is functioning as intended.  

---

## Failing Areas
- **API Layer:**  
  - `api.health.test.ts` fails, suggesting issues with backend health checks or mock configuration.  

- **Routing and Navigation:**  
  - `app.routing.test.tsx` and `App.test.tsx` failures point to instability in route handling or state synchronization.  
  - `Navbar.test.tsx` fails beyond smoke testing, highlighting deeper integration inconsistencies.  

- **Authentication and Session:**  
  - `OAuth.integration.test.tsx` fails, likely due to environment variables, token handling, or missing mocks.  
  - `SignIn.test.tsx` passes most UI checks but fails on the login callback (`onSignIn after successful login`).  
  - `useSession.test.ts` fails, indicating unreliable session persistence or authentication state handling.  

- **Feature Module:**  
  - `PremierLeague.test.tsx` fails, suggesting fragile data-fetching logic or incorrect assumptions about API responses.  

---

## Inferred Insights
- **Authentication flow** is the weakest layer. Failures in `OAuth`, `SignIn`, and `useSession` point to systemic issues in login and session management rather than isolated bugs.  
- **Routing and navigation** issues indicate that context providers or navigation hooks may not be fully configured in test environments.  
- **API instability** undermines confidence in end-to-end reliability. Failures may stem from mock data setup or backend availability.  
- **UI rendering** is comparatively strong. Most component rendering and accessibility checks pass, providing a stable base for further fixes.  

---

## Next Steps
1. **Authentication and Session:**  
   - Review login callback logic and ensure mocks are aligned with production behavior.  
   - Stabilize OAuth integration by verifying token exchange flows and environment setup.  
   - Address session persistence issues in `useSession` by checking state management and test isolation.  

2. **Routing and Navigation:**  
   - Validate route provider setup in the test environment.  
   - Confirm that navigation hooks and context values are properly mocked.  

3. **API Layer:**  
   - Revisit API mocks and ensure data responses align with production expectations.  
   - If using live services, verify backend availability during test runs.  

4. **Feature Reliability:**  
   - Debug `PremierLeague` tests for assumptions about API responses or timing.  

# =================STOPS HERE=========================

## 🔧 Files Overview

### **`setup.ts` - Test Environment Setup**
This file configures the testing environment and provides all necessary mocks.

**What it does:**
- Imports and configures Jest-DOM matchers
- Mocks environment variables for testing
- Mocks external dependencies (Google OAuth, Supabase)
- Sets up global mocks (fetch, console)
- Configures DOM environment for jsdom

**Key mocks:**
```typescript
// Environment variables
VITE_GOOGLE_CLIENT_ID: 'test-google-client-id'
VITE_SUPABASE_URL: 'https://test.supabase.co'
VITE_SUPABASE_ANON_KEY: 'test-anon-key'

// Google OAuth
useGoogleLogin: vi.fn()
GoogleOAuthProvider: Simple wrapper component

// Supabase
supabase.from().upsert(): Mocked database operations
supabase.from().select(): Mocked database queries

// Global APIs
fetch: vi.fn() - Mocked HTTP requests
console: Mocked to reduce test noise
```

### **`utils.tsx` - Test Utilities**
This file provides helper functions and utilities for writing tests.

**What it provides:**
- Mock data for Google OAuth tests
- Custom render function with providers
- Helper functions for common test scenarios
- Re-exports from testing library

**Key utilities:**
```typescript
// Mock data
export const mockGoogleOAuthData = { /* ... */ }

// Custom render function
export function customRender(ui, options) { /* ... */ }

// Helper functions
export const mockGoogleOAuthSuccess = () => { /* ... */ }
export const mockGoogleOAuthError = () => { /* ... */ }
export const mockNetworkError = () => { /* ... */ }
export const waitForAsync = (ms) => { /* ... */ }
```

## 🚀 Usage

### **Importing in Tests**
```typescript
// Import setup (automatically loaded by Vitest)
import '../test/setup';

// Import utilities
import { 
  mockGoogleOAuthData, 
  customRender, 
  mockGoogleOAuthSuccess 
} from '../test/utils';
```

### **Using Mock Data**
```typescript
import { mockGoogleOAuthData } from '../test/utils';

it('tests OAuth flow', () => {
  const { accessToken, userInfo, supabaseResponse } = mockGoogleOAuthData;
  
  // Use mock data in your test
  expect(userInfo.name).toBe('Test User');
});
```

### **Using Custom Render**
```typescript
import { customRender } from '../test/utils';

it('renders with providers', () => {
  const { getByText } = customRender(<MyComponent />, {
    withRouter: true,
    withOAuthProvider: true,
    clientId: 'test-client-id'
  });
  
  expect(getByText('Hello')).toBeInTheDocument();
});
```

### **Using Helper Functions**
```typescript
import { mockGoogleOAuthSuccess, waitForAsync } from '../test/utils';

it('handles OAuth success', async () => {
  const mockData = mockGoogleOAuthSuccess();
  
  // Test with mock data
  // ... test logic ...
  
  // Wait for async operations
  await waitForAsync(100);
});
```

## 🔍 Mock Behavior

### **Google OAuth Mocks**
- `useGoogleLogin` returns a mock function
- OAuth callbacks can be triggered manually in tests
- Success/error scenarios can be simulated

### **Supabase Mocks**
- Database operations return configurable responses
- Error scenarios can be simulated
- Connection testing is supported

### **Environment Mocks**
- All Vite environment variables are mocked
- Tests run in isolation from real environment
- Consistent test environment across different machines

## 🧪 Writing Tests

### **Basic Test Pattern**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignIn } from '../SignIn';

describe('SignIn Component', () => {
  it('renders sign in button', () => {
    render(<SignIn onSignIn={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### **Testing OAuth Flow**
```typescript
it('handles OAuth success', async () => {
  const mockOnSignIn = vi.fn();
  render(<SignIn onSignIn={mockOnSignIn} />);
  
  // Simulate OAuth success
  const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
  await loginCallback.onSuccess({ access_token: 'token' });
  
  // Assert expected behavior
  await waitFor(() => {
    expect(mockOnSignIn).toHaveBeenCalled();
  });
});
```

### **Testing Error Scenarios**
```typescript
it('handles network error', async () => {
  // Mock network failure
  (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
  
  // Test error handling
  // ... test logic ...
});
```

## 🚨 Common Issues

### **Mocks Not Working**
- Ensure mocks are imported before component rendering
- Check that mock functions are properly configured
- Verify mock return values match expected types

### **Async Test Failures**
- Use `waitFor` for async operations
- Set appropriate timeouts for long-running operations
- Ensure all promises are properly awaited

### **Provider Context Issues**
- Wrap components with necessary providers in tests
- Use `customRender` for complex provider setups
- Mock provider hooks when testing in isolation

## 📚 Related Documentation

- **`TESTING.md`**: Comprehensive testing documentation
- **`TESTING_QUICK_REFERENCE.md`**: Quick commands and status
- **`TESTING_TROUBLESHOOTING.md`**: Known issues and solutions

## 🔮 Future Enhancements

### **Planned Improvements**
1. **Better Router Mocking**: Improve React Router test support
2. **More Mock Data**: Add additional test scenarios
3. **Performance Testing**: Add utilities for performance testing
4. **Visual Testing**: Add support for visual regression testing

### **Contributing**
When adding new mocks or utilities:
1. Update this README
2. Add JSDoc comments to functions
3. Include usage examples
4. Update related documentation files

---

**This testing infrastructure provides a solid foundation for testing Google OAuth functionality. All core OAuth flows are fully testable and working!** 🎉

