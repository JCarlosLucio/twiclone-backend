const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');

const app = require('../app');
const User = require('../models/user');
const { usersInDb } = require('./test_helper');

const api = supertest(app);

describe('Users', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const saltRounds = 10;
    const password = await bcrypt.hash('test', saltRounds);
    const user = new User({ email: 'test@example.com', password });
    await user.save();
    // extended timeout to avoid failing tests for timeout when running beforeEach
  }, 100000);

  describe('getting users', () => {
    test('should return users as json', async () => {
      await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    test('should gets all users', async () => {
      const response = await api.get('/api/users');
      expect(response.body).toHaveLength(1);
    });

    test('should return users without password field', async () => {
      const response = await api.get('/api/users');
      const properties = Object.keys(response.body[0]);
      expect(properties).not.toContain('password');
    });
  });

  describe('creating users', () => {
    test('creation should succed with status 200', async () => {
      const newUser = {
        email: 'create@example.com',
        password: '1234',
      };

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const usersAfter = await usersInDb();

      expect(usersAfter).toHaveLength(2);
    });
  });

  describe('logging in', () => {
    test('should return token if there is email/password', async () => {
      const toLogin = {
        email: 'test@example.com',
        password: 'test',
      };

      const response = await api
        .post('/api/login')
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

      await api.post('/api/login').send(toLogin).expect(401);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);