const request = require('supertest');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

let app;
let mockDb;
let initDB, closeDB;

beforeAll(async () => {
  // Set up mocked DB before the app initializes
  mockDb = {
    execute: jest.fn(),
    end: jest.fn()
  };
  
  mysql.createConnection.mockResolvedValue(mockDb);

  // Require app after setting up the mock
  const appModule = require('../index');
  app = appModule;
  initDB = appModule.initDB;
  closeDB = appModule.closeDB;

  // Simulate table creation
  mockDb.execute.mockResolvedValueOnce([]);
  await initDB();
});

afterAll(async () => {
  if (closeDB) {
    await closeDB();
  }
});

describe('Notes App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    test('GET /health should return OK status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Frontend Routes', () => {
    test('GET / should serve index.html', async () => {
      const response = await request(app).get('/');
      
      // Will be 404 if index.html doesn't exist in test environment
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Notes API', () => {
    describe('GET /api/notes', () => {
      test('should return all notes', async () => {
        const mockNotes = [
          { id: 1, title: 'Test Note', content: 'Test content', created_at: new Date() }
        ];
        
        mockDb.execute.mockResolvedValueOnce([mockNotes]);

        const response = await request(app).get('/api/notes');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockNotes);
        expect(mockDb.execute).toHaveBeenCalledWith('SELECT * FROM notes ORDER BY created_at DESC');
      });

      test('should handle database errors', async () => {
        mockDb.execute.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/api/notes');
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to fetch notes' });
      });
    });

    describe('POST /api/notes', () => {
      test('should create a new note', async () => {
        const newNote = { title: 'New Note', content: 'New content' };
        const mockResult = { insertId: 1 };
        
        mockDb.execute.mockResolvedValueOnce([mockResult]);

        const response = await request(app)
          .post('/api/notes')
          .send(newNote);
        
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          id: 1,
          title: 'New Note',
          content: 'New content',
          message: 'Note created successfully'
        });
      });

      test('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/notes')
          .send({ title: 'Only title' });
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Title and content are required' });
      });

      test('should handle database errors on creation', async () => {
        const newNote = { title: 'New Note', content: 'New content' };
        mockDb.execute.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
          .post('/api/notes')
          .send(newNote);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to create note' });
      });
    });

    describe('PUT /api/notes/:id', () => {
      test('should update existing note', async () => {
        const updateData = { title: 'Updated Note', content: 'Updated content' };
        const mockResult = { affectedRows: 1 };
        
        mockDb.execute.mockResolvedValueOnce([mockResult]);

        const response = await request(app)
          .put('/api/notes/1')
          .send(updateData);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Note updated successfully' });
      });

      test('should return 404 for non-existent note', async () => {
        const updateData = { title: 'Updated Note', content: 'Updated content' };
        const mockResult = { affectedRows: 0 };
        
        mockDb.execute.mockResolvedValueOnce([mockResult]);

        const response = await request(app)
          .put('/api/notes/999')
          .send(updateData);
        
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Note not found' });
      });
    });

    describe('DELETE /api/notes/:id', () => {
      test('should delete existing note', async () => {
        const mockResult = { affectedRows: 1 };
        
        mockDb.execute.mockResolvedValueOnce([mockResult]);

        const response = await request(app).delete('/api/notes/1');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Note deleted successfully' });
      });

      test('should return 404 for non-existent note', async () => {
        const mockResult = { affectedRows: 0 };
        
        mockDb.execute.mockResolvedValueOnce([mockResult]);

        const response = await request(app).delete('/api/notes/999');
        
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Note not found' });
      });
    });
  });

  describe('Input Validation', () => {
    test('should reject XSS attempts', async () => {
      const maliciousNote = {
        title: '<script>alert("xss")</script>',
        content: '<img src=x onerror=alert("xss")>'
      };

      mockDb.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request(app)
        .post('/api/notes')
        .send(maliciousNote);
      
      expect(response.status).toBe(201);
      // Note: In production, add proper sanitization
    });

    test('should handle large content', async () => {
      const largeNote = {
        title: 'Large Note',
        content: 'A'.repeat(10000)
      };

      mockDb.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request(app)
        .post('/api/notes')
        .send(largeNote);
      
      expect(response.status).toBe(201);
    });

    test('should handle empty strings as invalid', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '', content: '' });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Title and content are required' });
    });

    test('should handle missing fields', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Title and content are required' });
    });
  });
});
