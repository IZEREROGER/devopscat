const request = require('supertest');

describe('Notes App - Basic Tests', () => {
  let app;

  beforeAll(async () => {
    // Set minimal test environment
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_NAME = 'notes_app_test';
    
    // Import app
    app = require('../index');
    
    // Give app time to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  afterAll(async () => {
    // Clean shutdown
    const { closeDB } = require('../index');
    if (closeDB) {
      await closeDB().catch(() => {});
    }
  });

  describe('Health Check', () => {
    test('GET /health returns 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
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
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('GET /api/notes returns array', async () => {
      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
