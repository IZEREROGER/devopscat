// Test setup and utilities
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Set test database environment variables
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_USER = process.env.TEST_DB_USER || 'root';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'password';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'notes_app_test';

// Suppress console.log during tests (use Jest's built-in mocking)
if (process.env.NODE_ENV === 'test') {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
}

// Global test utilities
global.testUtils = {
  createMockNote: (overrides = {}) => ({
    title: 'Test Note',
    content: 'Test content',
    ...overrides
  }),
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Clean up after tests
afterAll(async () => {
  // Restore console methods
  jest.restoreAllMocks();
  
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});
