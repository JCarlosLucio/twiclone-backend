const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');

const app = require('../app');
const User = require('../models/user');
// const { usersInDb } = require('./test_helper');

const api = supertest(app);

describe('Users', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const saltRounds = 10;
    const password = await bcrypt.hash('test', saltRounds);
    const user = new User({
      name: 'Tester',
      username: 'tester',
      email: 'test@example.com',
      password,
    });
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

  describe('getting user by username', () => {
    test('should return user', async () => {
      const username = 'tester';

      const userResponse = await api.get(`/api/users/${username}`).expect(200);

      const properties = Object.keys(userResponse.body);

      expect(properties).not.toContain('password');
      expect(properties).not.toContain('token');

      expect(properties).toContain('name');
      expect(properties).toContain('username');
      expect(properties).toContain('email');
      expect(properties).toContain('createdAt');
      expect(properties).toContain('updatedAt');
      expect(properties).toContain('id');
    });

    test('should fail with 404 Not Found when user not found', async () => {
      const username = 'thisusernamedoesntexist';

      const userResponse = await api.get(`/api/users/${username}`).expect(404);

      expect(userResponse.body.error).toBe('User not found.');
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);
