# IOB Client Tests

This directory contains automated tests for the IOB client library. These tests help ensure that future changes don't break existing functionality.

## Test Structure

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between different parts of the library
- **Mock Tests**: Test against mocked API responses
- **E2E Tests**: Tests against an actual API (requires valid certificates)

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run with coverage report
npm run test:coverage

# Run E2E tests (requires configured certificates)
npm run test:e2e
```

## Test Configuration

For E2E tests, you need to provide certificates and API configuration:

1. Create a `.env.test` file in the project root with the following content:
```
IOB_API_URL=https://api-test.example.com
IOB_CERT_PATH=./tests/certs/client.crt
IOB_KEY_PATH=./tests/certs/client.key
IOB_REJECT_UNAUTHORIZED=false
```

2. Place your test certificates in the `tests/certs` directory

## Adding New Tests

When adding new functionality to the library, be sure to add corresponding tests:

1. Unit tests for all new functions
2. Mock tests to verify expected API interaction
3. E2E tests for critical functionality

## Test Coverage

We aim to maintain at least 80% test coverage for the codebase. Run `npm run test:coverage` to generate a coverage report. 