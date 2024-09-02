import request from 'supertest';
import { expect } from 'chai';
import app from '../server';

describe('API Endpoints', () => {
  describe('GET /status', () => {
    it('should return the status of Redis and DB', async () => {
      const res = await request(app).get('/status');
      expect(res.status).to.equal(200);
      expect(res.body.redis).to.be.true;
      expect(res.body.db).to.be.true;
    });
  });

  describe('GET /stats', () => {
    it('should return the number of users and files', async () => {
      const res = await request(app).get('/stats');
      expect(res.status).to.equal(200);
      expect(res.body.users).to.equal(5);
      expect(res.body.files).to.equal(5);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@example.com', password: 'password' });
      expect(res.status).to.equal(201);
      expect(res.body.email).to.equal('test@example.com');
    });
  });

});

