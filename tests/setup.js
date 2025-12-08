// Test setup and utilities
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Suppress console.log during tests (use Jest's built-in mocking)
if (process.env.NODE_ENV === 'test') {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
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
