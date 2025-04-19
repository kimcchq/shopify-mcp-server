# Testing Strategy for Shopify MCP Server

This document outlines the testing strategy for the Shopify MCP Server project, focusing on unit tests to ensure code quality and reliability.

## Testing Approach

### Unit Testing

- **Framework**: Jest with TypeScript support
- **Focus**: Testing individual modules in isolation
- **Mocking**: External dependencies (like Shopify API) are mocked to avoid real API calls
- **Coverage Goal**: Aim for 80%+ code coverage

### Test Organization

Tests are organized to mirror the project structure:

```
src/
├── __tests__/
│   ├── ShopifyClient.test.ts
│   ├── tools/
│   │   ├── productTools.test.ts
│   │   ├── customerTools.test.ts
│   │   └── ...
│   └── utils/
│       ├── cache.test.ts
│       ├── errorHandler.test.ts
│       └── ...
```

### Testing Patterns

1. **Utility Functions**: Focus on input/output validation with different scenarios
2. **ShopifyClient**: Test API methods with mocked responses
3. **Tool Modules**: Ensure proper integration with ShopifyClient and handling of responses

## Mocking Strategy

### External Services

Shopify API calls are mocked to:
- Ensure tests run quickly without external dependencies
- Avoid rate limits or authentication issues
- Control test data precisely
- Allow testing edge cases and error scenarios

### Mock Implementation

Mocks are implemented at these levels:
- `graphql-request` module is mocked for ShopifyClient tests
- ShopifyClient itself is mocked for testing tool modules

### Code Example

```typescript
// Example of mocking graphql-request
jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn().mockImplementation(() => mockedResponse)
  }))
}));
```

## Test Types

1. **Happy Path Tests**: Verifying functionality works as expected with valid inputs
2. **Error Handling Tests**: Ensuring proper error responses for invalid inputs or API failures
3. **Edge Case Tests**: Testing boundary conditions and unusual inputs

## Running Tests

### Standard Execution

```bash
npm test
```

### With Coverage Report

```bash
npm test -- --coverage
```

### Single File/Pattern

```bash
npm test -- src/__tests__/utils/cache.test.ts
```

## Future Enhancements

1. **Integration Tests**: Add integration tests to verify tool modules work correctly together
2. **End-to-End Tests**: Consider adding E2E tests with a test Shopify store
3. **Snapshot Testing**: Implement snapshot tests for complex responses
4. **CI Integration**: Add automated testing in CI pipeline

## Best Practices

1. Each test should be independent and not rely on the state of other tests
2. Use descriptive test names that explain what's being tested
3. Group related tests with `describe` blocks
4. Use setup and teardown (`beforeEach`/`afterEach`) for common logic
5. Mock only what's necessary to keep tests realistic