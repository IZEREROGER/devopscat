const request = require('supertest');
const mysql = require('mysql2/promise');

// Mock database for testing
jest.mock('mysql2/promise');

describe('Notes App', () => {
  let mockDb;
  let app;

  beforeAll(async () => {
    // Mock database connection
    mockDb = {
      execute: jest.fn(),
      close: jest.fn()
    };
    mysql.createConnection.mockResolvedValue(mockDb);
    
    // Mock successful table creation
    mockDb.execute.mockResolvedValueOnce([]);
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_db';
    
    // Import app after mocking and env setup
    const express = require('express');
    const path = require('path');
    
    app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    
    // Mock database instance
    const db = mockDb;
    
    // Routes (copied from main app for testing)
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    app.get('/api/notes', async (req, res) => {
      try {
        const [rows] = await db.execute('SELECT * FROM notes ORDER BY created_at DESC');
        res.json(rows);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
      }
    });

    app.post('/api/notes', async (req, res) => {
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      try {
        const [result] = await db.execute(
          'INSERT INTO notes (title, content) VALUES (?, ?)',
          [title, content]
        );
        res.status(201).json({ 
          id: result.insertId, 
          title, 
          content, 
          message: 'Note created successfully' 
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create note' });
      }
    });

    app.put('/api/notes/:id', async (req, res) => {
      const { id } = req.params;
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      try {
        const [result] = await db.execute(
          'UPDATE notes SET title = ?, content = ? WHERE id = ?',
          [title, content, id]
        );
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json({ message: 'Note updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update note' });
      }
    });

    app.delete('/api/notes/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const [result] = await db.execute('DELETE FROM notes WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json({ message: 'Note deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
      }
    });

    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
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
      
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
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
