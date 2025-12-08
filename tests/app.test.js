const request = require('supertest');

// Mock the database module to avoid connection issues
jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn(() => Promise.resolve({
    execute: jest.fn(() => Promise.resolve([[], {}])),
    end: jest.fn(() => Promise.resolve())
  }))
}));

const app = require('../index');

describe('Notes App - Basic Tests', () => {
  describe('Health Check', () => {
    test('GET /health returns 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Static Files', () => {
    test('GET / returns HTML', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('API Validation', () => {
    test('POST /api/notes requires title and content', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '', content: '' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/notes returns array', async () => {
      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('PUT /api/notes/:id validates input', async () => {
      const response = await request(app)
        .put('/api/notes/1')
        .send({ title: '', content: '' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('DELETE /api/notes/:id accepts valid id', async () => {
      const response = await request(app).delete('/api/notes/999');
      // Should return 404 since note doesn't exist, but not 400 for invalid request
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('API Error Handling', () => {
    test('handles invalid routes', async () => {
      const response = await request(app).get('/api/invalid-route');
      expect(response.status).toBe(404);
    });

    test('handles malformed JSON', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect(response.status).toBe(400);
    });
  });
});
