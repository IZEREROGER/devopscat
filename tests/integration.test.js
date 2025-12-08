const request = require('supertest');
const mysql = require('mysql2/promise');

const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'notes_app_test'
};

describe('Integration Tests', () => {
  let db;
  let app;

  beforeAll(async () => {
    // Create test database
    const connection = await mysql.createConnection({
      ...testDbConfig,
      database: undefined
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testDbConfig.database}`);
    await connection.end();

    // Set test environment
    process.env.DB_HOST = testDbConfig.host;
    process.env.DB_USER = testDbConfig.user;
    process.env.DB_PASSWORD = testDbConfig.password;
    process.env.DB_NAME = testDbConfig.database;

    // Import app after setting env vars
    app = require('../index');
    
    // Wait for database initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    db = await mysql.createConnection(testDbConfig);
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.execute('DELETE FROM notes');
    await db.execute('ALTER TABLE notes AUTO_INCREMENT = 1');
  });

  afterAll(async () => {
    if (db) {
      await db.execute(`DROP DATABASE ${testDbConfig.database}`);
      await db.end();
    }
  });

  describe('Full CRUD Operations', () => {
    test('should perform complete note lifecycle', async () => {
      // Create note
      const createResponse = await request(app)
        .post('/api/notes')
        .send({
          title: 'Integration Test Note',
          content: 'This is a test note for integration testing'
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.id).toBe(1);

      // Read notes
      const readResponse = await request(app).get('/api/notes');
      expect(readResponse.status).toBe(200);
      expect(readResponse.body).toHaveLength(1);
      expect(readResponse.body[0].title).toBe('Integration Test Note');

      // Update note
      const updateResponse = await request(app)
        .put('/api/notes/1')
        .send({
          title: 'Updated Integration Test Note',
          content: 'This content has been updated'
        });

      expect(updateResponse.status).toBe(200);

      // Verify update
      const readUpdatedResponse = await request(app).get('/api/notes');
      expect(readUpdatedResponse.body[0].title).toBe('Updated Integration Test Note');

      // Delete note
      const deleteResponse = await request(app).delete('/api/notes/1');
      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const readEmptyResponse = await request(app).get('/api/notes');
      expect(readEmptyResponse.body).toHaveLength(0);
    });

    test('should handle concurrent operations', async () => {
      // Create multiple notes concurrently
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/notes')
          .send({
            title: `Concurrent Note ${i + 1}`,
            content: `Content for note ${i + 1}`
          })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.title).toBe(`Concurrent Note ${index + 1}`);
      });

      // Verify all notes were created
      const readResponse = await request(app).get('/api/notes');
      expect(readResponse.body).toHaveLength(10);
    });
  });

  describe('Database Constraints', () => {
    test('should enforce NOT NULL constraints', async () => {
      // This would be handled by application validation
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '', content: '' });

      expect(response.status).toBe(400);
    });

    test('should handle database disconnection gracefully', async () => {
      // Simulate database connection loss
      await db.end();

      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(500);

      // Reconnect for cleanup
      db = await mysql.createConnection(testDbConfig);
    });
  });
});
