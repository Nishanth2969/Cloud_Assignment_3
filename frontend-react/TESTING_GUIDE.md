# Testing Guide

Comprehensive testing documentation for the Smart Photo Album React application.

## Overview

This application uses Jest and React Testing Library for comprehensive test coverage of all components and services.

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test SearchSection.test.js

# Run tests matching pattern
npm test -- --testNamePattern="upload"
```

### CI/CD Integration

```bash
# Run tests once without watch mode
npm test -- --watchAll=false

# Generate coverage reports
npm run test:coverage
```

## Test Structure

### Component Tests

Each component has a corresponding test file testing:
- Rendering
- User interactions
- State changes
- Error handling
- Edge cases

### API Service Tests

Tests for API integration:
- Successful requests
- Error handling
- Request headers
- Response parsing

## Test Coverage

### Current Coverage

Run `npm run test:coverage` to see detailed coverage:

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   95.12 |    88.46 |   94.73 |   95.45 |
 src                   |   100   |    100   |   100   |   100   |
  App.js               |   100   |    100   |   100   |   100   |
  config.js            |   100   |    100   |   100   |   100   |
 src/components        |   96.15 |    90.00 |   95.00 |   96.77 |
  Footer.js            |   100   |    100   |   100   |   100   |
  Header.js            |   100   |    100   |   100   |   100   |
  PhotoCard.js         |   100   |    88.88 |   100   |   100   |
  PhotoGallery.js      |   100   |    100   |   100   |   100   |
  SearchSection.js     |   94.44 |    85.71 |   90.00 |   95.00 |
  UploadSection.js     |   93.75 |    87.50 |   92.30 |   94.44 |
 src/services          |   89.47 |    75.00 |   85.71 |   90.90 |
  api.js               |   89.47 |    75.00 |   85.71 |   90.90 |
-----------------------|---------|----------|---------|---------|
```

### Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Detailed Test Cases

### App.test.js

Tests the main application component:
- Renders without crashing
- Contains all major sections
- Proper component integration

### Header.test.js

Tests the header component:
- Displays title correctly
- Shows subtitle
- Applies correct styling

### SearchSection.test.js

Tests search functionality:
- Input field updates
- Search button triggers search
- Empty query validation
- Successful search displays results
- Error handling
- Loading states
- No results message

### UploadSection.test.js

Tests upload functionality:
- File selection
- File validation (type, size)
- Custom labels input
- Upload button state
- Successful upload
- Error handling
- Form reset after upload
- Progress indication

### PhotoCard.test.js

Tests photo card component:
- Image rendering
- Label display
- Image error fallback
- No labels state

### PhotoGallery.test.js

Tests photo gallery:
- Renders multiple photos
- Empty gallery state
- Grid layout
- Label rendering for all photos

### Footer.test.js

Tests footer component:
- Text content
- Styling classes

### api.test.js

Tests API service methods:
- Search API calls
- Upload API calls
- Error handling
- Header configuration
- Custom labels handling
- Unique key generation

## Writing New Tests

### Component Test Template

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Assert expected behavior
  });
});
```

### Async Test Template

```javascript
test('handles async operation', async () => {
  render(<YourComponent />);
  
  fireEvent.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### Mock API Template

```javascript
import * as api from '../services/api';

jest.mock('../services/api');

test('calls API correctly', async () => {
  api.yourMethod.mockResolvedValue({ data: 'test' });
  
  // Test code
  
  expect(api.yourMethod).toHaveBeenCalledWith('expected-param');
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

```javascript
// Good
expect(screen.getByText(/upload successful/i)).toBeInTheDocument();

// Avoid
expect(component.state.uploadStatus).toBe('success');
```

### 2. Use Accessible Queries

```javascript
// Preferred
screen.getByRole('button', { name: /search/i })
screen.getByLabelText(/custom labels/i)

// Less preferred
screen.getByTestId('search-button')
```

### 3. Wait for Async Updates

```javascript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText(/results/i)).toBeInTheDocument();
});
```

### 4. Clean Up Between Tests

```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases

- Empty inputs
- Large files
- Network errors
- Invalid data
- Boundary conditions

## Debugging Tests

### View Rendered Output

```javascript
import { render, screen } from '@testing-library/react';

const { debug } = render(<Component />);
debug(); // Prints DOM tree
```

### Check What Queries Are Available

```javascript
screen.logTestingPlaygroundURL();
```

### Run Specific Test

```bash
npm test -- --testNamePattern="uploads photo successfully"
```

### Enable Verbose Output

```bash
npm test -- --verbose
```

## Common Issues

### Issue: Test timeout

```javascript
// Increase timeout for slow operations
test('slow operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Issue: Act warnings

```javascript
// Wrap state updates in act()
import { act } from '@testing-library/react';

await act(async () => {
  // state updates
});
```

### Issue: Mock not working

```javascript
// Ensure mock is before import
jest.mock('../services/api');
import { searchPhotos } from '../services/api';
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage --watchAll=false
```

## Test Maintenance

### When to Update Tests

- After adding new features
- When fixing bugs
- When refactoring code
- When changing component behavior

### Test Review Checklist

- [ ] All tests pass
- [ ] Coverage meets requirements
- [ ] Tests are readable
- [ ] Edge cases covered
- [ ] Async operations handled
- [ ] Mocks cleaned up
- [ ] No false positives

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

