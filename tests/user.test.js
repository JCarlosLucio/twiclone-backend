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
  });

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
});

afterAll(() => {
  mongoose.connection.close();
});
