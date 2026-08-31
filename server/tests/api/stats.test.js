const request = require('supertest');
const app = require('../../server');
const Confession = require('../../models/Confession');
const Comment = require('../../models/Comment');
const User = require('../../models/User');

describe('System & Stats API Automation Tests', () => {
  describe('GET /api/ping', () => {
    it('should respond with health check status 200', async () => {
      const res = await request(app).get('/api/ping');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: 'Server is awake' });
    });
  });

  describe('GET /api/stats', () => {
    it('should aggregate correct count of confessions, comments, and users', async () => {
      jest.spyOn(Confession, 'countDocuments').mockResolvedValue(42);
      jest.spyOn(Comment, 'countDocuments').mockResolvedValue(15);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(8);

      const res = await request(app).get('/api/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        confessions: 42,
        comments: 15,
        users: 8
      });
    });

    it('should handle database errors gracefully with 500 status', async () => {
      jest.spyOn(Confession, 'countDocuments').mockRejectedValue(new Error('Database query failed'));

      const res = await request(app).get('/api/stats');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Database query failed');
    });
  });
});
