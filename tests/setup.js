// Test setup and utilities
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Suppress console.log during tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
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
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});
