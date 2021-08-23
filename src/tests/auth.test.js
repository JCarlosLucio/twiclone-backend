const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');

const app = require('../app');
const User = require('../models/user');
const { usersInDb } = require('./test_helper');

const api = supertest(app);

describe('Auth', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const saltRounds = 10;
    const password = await bcrypt.hash('test', saltRounds);
    const user = new User({ email: 'test@example.com', password });
    await user.save();
    // extended timeout to avoid failing tests for timeout when running beforeEach
  }, 100000);

  describe('register', () => {
    test('creation should succed with status 200', async () => {
      const newUser = {
        email: 'create@example.com',
        password: '1234',
      };

      await api
        .post('/api/auth/register')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const usersAfter = await usersInDb();

      expect(usersAfter).toHaveLength(2);
    });

    test('should fail with 400 Bad Request if email is missing', async () => {
      const newUser = {
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if email malformatted', async () => {
      const newUser = {
        email: 'notanEmail',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if password missing', async () => {
      const newUser = {
        email: 'test@example.com',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if password too short', async () => {
      const newUser = {
        email: 'test@example.com',
        password: '1',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });
  });

  describe('logging in', () => {
    test('should return token if there is email/password', async () => {
      const toLogin = {
        email: 'test@example.com',
        password: 'test',
      };

      const response = await api
        .post('/api/auth/login')
        .send(toLogin)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const properties = Object.keys(response.body);
      expect(properties).toContain('token');
    });

    test('should fail with 401 Unauthorized if email/password are wrong', async () => {
      const toLogin = {
        email: 'test@example.com',
        password: 'wrong',
      };

      await api.post('/api/auth/login').send(toLogin).expect(401);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);
