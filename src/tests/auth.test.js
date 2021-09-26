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
    const user = new User({
      name: 'Tester',
      username: 'tester',
      email: 'test@example.com',
      password,
    });
    await user.save();
    // extended timeout to avoid failing tests for timeout when running beforeEach
  }, 100000);

  describe('register', () => {
    test('creation should succed with status 200', async () => {
      const newUser = {
        name: 'New User',
        username: 'new_user',
        email: 'new_user@example.com',
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

    test('should fail with 400 Bad Request if password missing', async () => {
      const newUser = {
        name: 'New User',
        username: 'new_user',
        email: 'new_user@example.com',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if password too short', async () => {
      const newUser = {
        name: 'New User',
        username: 'new_user',
        email: 'new_user@example.com',
        password: '1',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if email is missing', async () => {
      const newUser = {
        name: 'New User',
        username: 'new_user',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if email malformatted', async () => {
      const newUser = {
        name: 'New User',
        username: 'new_user',
        email: 'notanEmail',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if email not unique', async () => {
      const newUser = {
        name: 'New User',
        username: 'new_user',
        email: 'test@example.com',
        password: '1234',
      };

      const response = await api
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBe('email has already been taken.');
    });

    test('should fail with 400 Bad Request if username is missing', async () => {
      const newUser = {
        name: 'New User',
        email: 'new_user@example.com',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if username is too short', async () => {
      const newUser = {
        name: 'New User',
        username: 'new',
        email: 'new_user@example.com',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if username is too long', async () => {
      const newUser = {
        name: 'New User',
        username: '1234567890123456',
        email: 'new_user@example.com',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if username has forbidden characters', async () => {
      const newUser = {
        name: 'New User',
        username: '$asdf@_123*',
        email: 'new_user@example.com',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });

    test('should fail with 400 Bad Request if username not unique', async () => {
      const newUser = {
        name: 'New User',
        username: 'tester',
        email: 'new_user@example.com',
        password: '1234',
      };

      const response = await api
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBe('username has already been taken.');
    });

    test('should fail with 400 Bad Request if name is missing', async () => {
      const newUser = {
        username: 'new_user',
        email: 'new_user@example.com',
        password: '1234',
      };

      await api.post('/api/auth/register').send(newUser).expect(400);
    });
  });

  describe('logging in', () => {
    test('should return token if there is correct email/password', async () => {
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

    test('should fail with 400 Bad Request if email is missing', async () => {
      const toLogin = {
        password: '1234',
      };

      await api.post('/api/auth/login').send(toLogin).expect(400);
    });

    test('should fail with 400 Bad Request if email malformatted', async () => {
      const toLogin = {
        email: 'notanEmail',
        password: '1234',
      };

      await api.post('/api/auth/login').send(toLogin).expect(400);
    });

    test('should fail with 400 Bad Request if password missing', async () => {
      const toLogin = {
        email: 'test@example.com',
      };

      await api.post('/api/auth/login').send(toLogin).expect(400);
    });
  });

  describe('getting me', () => {
    test('should return me(user) with token', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const meResponse = await api
        .get('/api/auth/me')
        .set('Authorization', token)
        .expect(200);

      const properties = Object.keys(meResponse.body);

      expect(properties).not.toContain('password');
      expect(properties).toContain('token');
      expect(properties).toContain('name');
      expect(properties).toContain('username');
      expect(properties).toContain('email');
      expect(properties).toContain('createdAt');
      expect(properties).toContain('updatedAt');
      expect(properties).toContain('id');
    });

    test('should fail with 401 Unauthorized if invalid token', async () => {
      const token = 'Bearer invalidtoken';

      const meResponse = await api
        .get('/api/auth/me')
        .set('Authorization', token)
        .expect(401);

      expect(meResponse.body.error).toBe('invalid token');
    });

    test('should fail with 401 Unauthorized if no token', async () => {
      const meResponse = await api.get('/api/auth/me').expect(401);

      expect(meResponse.body.error).toBe('invalid token');
    });
  });

  describe('updating me', () => {
    test('should update me', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const updatedMe = {
        name: 'UPDATED NAME',
        bio: 'this an updated bio',
        location: 'Updated Town',
      };

      const meResponse = await api
        .put('/api/auth/me')
        .set('Authorization', token)
        .send(updatedMe)
        .expect(200);

      expect(meResponse.body.name).not.toBe(response.body.name);
      expect(meResponse.body.name).toBe(updatedMe.name);
      expect(meResponse.body.bio).not.toBe(response.body.bio);
      expect(meResponse.body.bio).toBe(updatedMe.bio);
      expect(meResponse.body.location).not.toBe(response.body.location);
      expect(meResponse.body.location).toBe(updatedMe.location);
    });

    test('should update me without bio/location', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const updatedMe = {
        name: 'UPDATED NAME',
      };

      const meResponse = await api
        .put('/api/auth/me')
        .set('Authorization', token)
        .send(updatedMe)
        .expect(200);

      expect(meResponse.body.name).not.toBe(response.body.name);
      expect(meResponse.body.name).toBe(updatedMe.name);
      expect(meResponse.body.bio).toBe('');
      expect(meResponse.body.location).toBe('');
    });

    test('should fail with 400 Bad Request if name is missing', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const updatedMe = {
        bio: 'this is no name',
        location: 'Updated Town',
      };

      const meResponse = await api
        .put('/api/auth/me')
        .set('Authorization', token)
        .send(updatedMe)
        .expect(400);

      expect(meResponse.body.error).toBe('body.name is a required field');
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);
