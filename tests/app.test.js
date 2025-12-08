const request = require('supertest');

describe('Notes App - Basic Tests', () => {
  let app;
  let mockDB;

  beforeAll(() => {
    // Mock the database module with proper implementation
    const mysql = require('mysql2/promise');
    
    mockDB = {
      execute: jest.fn(),
      end: jest.fn(() => Promise.resolve())
    };

    // Mock different responses for different queries
    mockDB.execute.mockImplementation((query) => {
      if (query.includes('CREATE TABLE')) {
        return Promise.resolve([{}, {}]);
      }
      if (query.includes('SELECT')) {
        return Promise.resolve([[], {}]); // Empty array of notes
      }
      if (query.includes('INSERT')) {
        return Promise.resolve([{ insertId: 1, affectedRows: 1 }, {}]);
      }
      if (query.includes('UPDATE') || query.includes('DELETE')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });

    mysql.createConnection = jest.fn(() => Promise.resolve(mockDB));

    // Import app after mocking
    app = require('../index');
  });

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
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
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

  describe('API CRUD Operations', () => {
    test('POST /api/notes creates a note', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Test Note',
          content: 'Test Content'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Note');
    });

    test('PUT /api/notes/:id updates a note', async () => {
      const response = await request(app)
        .put('/api/notes/1')
        .send({
          title: 'Updated Note',
          content: 'Updated Content'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});
