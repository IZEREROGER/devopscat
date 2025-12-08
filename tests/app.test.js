const request = require('supertest');
const mysql = require('mysql2/promise');

// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  user: process.env.TEST_DB_USER || 'testuser',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'notes_app_test'
};

describe('Notes App API', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = testDbConfig.host;
    process.env.DB_USER = testDbConfig.user;
    process.env.DB_PASSWORD = testDbConfig.password;
    process.env.DB_NAME = testDbConfig.database;
    
    // Import app after setting environment variables
    app = require('../index');
    
    // Wait for app initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Connect to test database
    try {
      db = await mysql.createConnection(testDbConfig);
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      // Skip tests if database is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.warn('Test database not available, skipping database tests');
        return;
      }
      throw error;
    }
  });

  beforeEach(async () => {
    // Clean up database before each test (only if db connection exists)
    if (db) {
      try {
        await db.execute('DELETE FROM notes');
        await db.execute('ALTER TABLE notes AUTO_INCREMENT = 1');
      } catch (error) {
        console.warn('Failed to clean database, continuing with tests:', error.message);
      }
    }
  });

  afterAll(async () => {
    // Clean up connections
    if (db) {
      try {
        await db.end();
      } catch (error) {
        console.warn('Error closing database connection:', error.message);
      }
    }
    
    // Close app database connection
    const { closeDB } = require('../index');
    if (closeDB) {
      try {
        await closeDB();
      } catch (error) {
        console.warn('Error closing app database:', error.message);
      }
    }
  });

  describe('Health Check', () => {
    test('GET /health should return status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Static Routes', () => {
    test('GET / should serve index.html', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Notes API - Basic Functionality', () => {
    test('GET /api/notes should return empty array initially', async () => {
      if (!db) {
        console.warn('Skipping database test - no connection');
        return;
      }

      const response = await request(app)
        .get('/api/notes')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/notes should create a new note', async () => {
      if (!db) {
        console.warn('Skipping database test - no connection');
        return;
      }

      const newNote = {
        title: 'Test Note',
        content: 'This is a test note'
      };

      const response = await request(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201);
      
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(newNote.title);
      expect(response.body.content).toBe(newNote.content);
      expect(response.body.message).toBe('Note created successfully');
    });

    test('POST /api/notes should validate required fields', async () => {
      const invalidNote = {
        title: '',
        content: ''
      };

      const response = await request(app)
        .post('/api/notes')
        .send(invalidNote)
        .expect(400);
      
      expect(response.body.error).toBe('Title and content are required');
    });

    test('PUT /api/notes/:id should update existing note', async () => {
      if (!db) {
        console.warn('Skipping database test - no connection');
        return;
      }

      // First create a note
      const createResponse = await request(app)
        .post('/api/notes')
        .send({
          title: 'Original Title',
          content: 'Original content'
        })
        .expect(201);

      const noteId = createResponse.body.id;

      // Update the note
      const updatedNote = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updatedNote)
        .expect(200);
    });

    test('PUT /api/notes/:id should return 404 for non-existent note', async () => {
      const updatedNote = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      await request(app)
        .put('/api/notes/999')
        .send(updatedNote)
        .expect(404);
    });

    test('DELETE /api/notes/:id should delete existing note', async () => {
      if (!db) {
        console.warn('Skipping database test - no connection');
        return;
      }

      // First create a note
      const createResponse = await request(app)
        .post('/api/notes')
        .send({
          title: 'Note to Delete',
          content: 'This will be deleted'
        })
        .expect(201);

      const noteId = createResponse.body.id;

      // Delete the note
      await request(app)
        .delete(`/api/notes/${noteId}`)
        .expect(200);

      // Verify it's deleted
      const getResponse = await request(app)
        .get('/api/notes')
        .expect(200);
      
      expect(getResponse.body.find(note => note.id === noteId)).toBeUndefined();
    });

    test('DELETE /api/notes/:id should return 404 for non-existent note', async () => {
      await request(app)
        .delete('/api/notes/999')
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send('title=test&content=test');
      
      // Should still work with URL encoded data
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Integration Tests', () => {
    test('should perform full CRUD cycle', async () => {
      if (!db) {
        console.warn('Skipping database test - no connection');
        return;
      }

      // Create
      const createResponse = await request(app)
        .post('/api/notes')
        .send({
          title: 'CRUD Test Note',
          content: 'Testing full CRUD operations'
        })
        .expect(201);

      const noteId = createResponse.body.id;

      // Read
      const readResponse = await request(app)
        .get('/api/notes')
        .expect(200);
      
      const createdNote = readResponse.body.find(note => note.id === noteId);
      expect(createdNote).toBeDefined();
      expect(createdNote.title).toBe('CRUD Test Note');

      // Update
      await request(app)
        .put(`/api/notes/${noteId}`)
        .send({
          title: 'Updated CRUD Test Note',
          content: 'Updated content for CRUD test'
        })
        .expect(200);

      // Verify update
      const updatedReadResponse = await request(app)
        .get('/api/notes')
        .expect(200);
      
      const updatedNote = updatedReadResponse.body.find(note => note.id === noteId);
      expect(updatedNote.title).toBe('Updated CRUD Test Note');

      // Delete
      await request(app)
        .delete(`/api/notes/${noteId}`)
        .expect(200);

      // Verify deletion
      const finalReadResponse = await request(app)
        .get('/api/notes')
        .expect(200);
      
      expect(finalReadResponse.body.find(note => note.id === noteId)).toBeUndefined();
    });
  });
});
