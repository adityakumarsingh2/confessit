const request = require('supertest');
const app = require('../../server');
const Confession = require('../../models/Confession');

describe('Confessions API Automation Tests', () => {
  describe('GET /api/confessions', () => {
    it('should return empty list when no confessions exist', async () => {
      jest.spyOn(Confession, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const res = await request(app).get('/api/confessions');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should filter public confessions by search term and mood', async () => {
      const mockData = [
        {
          _id: '507f1f77bcf86cd799439011',
          text: 'Secret crush on coding',
          mood: 'Love',
          anonName: 'SecretCoder',
          anonAvatar: 'http://avatar.url',
          createdAt: new Date()
        }
      ];

      jest.spyOn(Confession, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockData)
      });

      const searchRes = await request(app).get('/api/confessions?search=crush&mood=Love');
      expect(searchRes.statusCode).toEqual(200);
      expect(searchRes.body.length).toBe(1);
      expect(searchRes.body[0].text).toContain('crush');
      expect(searchRes.body[0].mood).toBe('Love');
    });
  });

  describe('GET /api/confessions/:id', () => {
    it('should return 404 for non-existent confession ID', async () => {
      jest.spyOn(Confession, 'findById').mockResolvedValue(null);

      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/confessions/${fakeId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Confession not found' });
    });

    it('should fetch a valid confession by ID', async () => {
      const mockConfession = {
        _id: '507f1f77bcf86cd799439011',
        text: 'Testing deep link fetching',
        mood: 'Hope',
        anonName: 'Tester',
        anonAvatar: 'http://avatar.url'
      };

      jest.spyOn(Confession, 'findById').mockResolvedValue(mockConfession);

      const res = await request(app).get(`/api/confessions/${mockConfession._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toBe(mockConfession._id);
      expect(res.body.text).toBe('Testing deep link fetching');
    });
  });
});
