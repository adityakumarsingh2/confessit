const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Confession = require('../../models/Confession');

describe('Private Messages & User Profiles API Automation Tests', () => {
  describe('GET /api/users/:id', () => {
    it('should return 404 for invalid user ID', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/users/${fakeId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return user public profile and increment visit count', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        anonName: 'OracleTarget',
        anonAvatar: 'http://avatar.url',
        visitCount: 1
      };

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app).get(`/api/users/${mockUser._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.anonName).toBe('OracleTarget');
      expect(res.body.visitCount).toBe(1);
    });
  });

  describe('POST /api/confessions/private', () => {
    it('should allow sending an anonymous private message to a recipient', async () => {
      const mockSavedConfession = {
        _id: '507f1f77bcf86cd799439022',
        text: 'Hey! This is a secret automated message.',
        mood: 'Love',
        recipientId: '507f1f77bcf86cd799439011',
        isAnonymous: true,
        allowComments: false,
        anonName: 'Anonymous Sender',
        anonAvatar: 'http://avatar.url'
      };

      jest.spyOn(Confession.prototype, 'save').mockResolvedValue(mockSavedConfession);

      const payload = {
        text: 'Hey! This is a secret automated message.',
        mood: 'Love',
        recipientId: '507f1f77bcf86cd799439011'
      };

      const res = await request(app)
        .post('/api/confessions/private')
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body._id).toBe(mockSavedConfession._id);
      expect(res.body.text).toBe(payload.text);
      expect(res.body.recipientId).toBe(payload.recipientId);
      expect(res.body.isAnonymous).toBe(true);
    });
  });
});
