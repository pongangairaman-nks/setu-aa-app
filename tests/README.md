# Testing Guide

This directory contains all test files for the Setu AA Mobile App.

## Test Structure

```
tests/
├── components/          # Component tests
├── screens/            # Screen tests
├── services/           # Service tests
├── hooks/              # Hook tests
├── utils/              # Utility function tests
└── __mocks__/          # Mock files
```

## Running Tests

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=Button.test.tsx
```

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Types

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Focus on isolated functionality

### Integration Tests
- Test component interactions
- Test API integrations
- Test navigation flows

### E2E Tests
- Test complete user journeys
- Use Detox for mobile testing
- Test real device interactions

## Writing Tests

### Component Tests

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../src/components/common/Button/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useConsent } from '../src/hooks/useConsent';

describe('useConsent Hook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useConsent());
    
    expect(result.current.consents).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
```

### Service Tests

```typescript
import { setuApi } from '../src/services/api/setuApi';

jest.mock('../src/services/api/apiClient');

describe('Setu API', () => {
  it('creates consent request', async () => {
    const mockResponse = {
      consentId: 'test-id',
      consentUrl: 'https://test.com',
      status: 'PENDING'
    };
    
    // Mock API client
    apiClient.post.mockResolvedValue(mockResponse);
    
    const result = await setuApi.createConsentRequest({
      fipId: 'test-fip',
      dataLife: 30,
      permissions: ['ACCOUNT']
    });
    
    expect(result).toEqual(mockResponse);
  });
});
```

## Mock Files

### API Mocks

```typescript
// __mocks__/api.ts
export const mockConsentResponse = {
  consentId: 'mock-consent-id',
  status: 'ACTIVE',
  fipName: 'Mock FIP',
  dataLife: 30,
  permissions: ['ACCOUNT', 'TRANSACTIONS'],
  createdAt: '2023-01-01T00:00:00.000Z',
  expiresAt: '2023-02-01T00:00:00.000Z'
};

export const mockAccountResponse = {
  accountId: 'mock-account-id',
  accountName: 'Mock Account',
  accountNumber: '1234567890',
  bankName: 'Mock Bank',
  accountType: 'SAVINGS',
  balance: 10000,
  status: 'ACTIVE'
};
```

### Navigation Mocks

```typescript
// __mocks__/navigation.ts
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  dangerouslyGetParent: jest.fn(),
  dangerouslyGetState: jest.fn(),
  dispatch: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(),
  navigate: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  removeListener: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
};
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup

```typescript
// tests/setup.ts
import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Native WebView
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

// Global test utilities
global.fetch = jest.fn();
```

## Best Practices

1. **Test Naming**: Use descriptive test names
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mock External Dependencies**: Don't test external services
4. **Test Edge Cases**: Include error scenarios
5. **Keep Tests Fast**: Avoid slow operations
6. **Maintain Test Data**: Use consistent mock data
7. **Test Coverage**: Aim for 80%+ coverage

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test -- --coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm test -- --verbose --no-coverage

# Debug specific test
npm test -- --testNamePattern="Button.*renders"
```

### Common Issues

1. **Async operations**: Use `waitFor` or `act`
2. **Navigation mocking**: Mock navigation props
3. **API calls**: Mock fetch or axios
4. **Platform differences**: Test on both platforms

## Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing/)
- [Detox E2E Testing](https://github.com/wix/Detox) 