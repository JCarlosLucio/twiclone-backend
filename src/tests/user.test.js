const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');

const app = require('../app');
const User = require('../models/user');
const { usersInDb, initialUsers } = require('./test_helper');

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
    const otherUser = new User({
      name: 'OtherUser',
      username: 'otheruser',
      email: 'otheruser@example.com',
      password,
    });

    await user.save();
    await otherUser.save();
    await User.create(
      initialUsers(otherUser._id).map((user) => ({ ...user, password }))
    );
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
      expect(response.body).toHaveLength(5);
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

  describe('following user', () => {
    test('should follow user', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const usersAtStart = await usersInDb();
      const userToFollow = usersAtStart[1];

      await api
        .post(`/api/users/${userToFollow.id}/follow`)
        .set('Authorization', token)
        .expect(200);

      const usersAtEnd = await usersInDb();

      expect(usersAtEnd[1].followers).toHaveLength(1);
      expect(usersAtEnd[1].followers[0].toString()).toBe(usersAtStart[0].id);
      expect(usersAtEnd[0].following).toHaveLength(1);
      expect(usersAtEnd[0].following[0].toString()).toContain(userToFollow.id);
    });

    test('should fail with 403 Forbidden if user tries to follow themselves', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const userResponse = await api
        .post(`/api/users/${response.body.id}/follow`)
        .set('Authorization', token)
        .expect(403);

      expect(userResponse.body.error).toBe('Cannot follow yourself');
    });

    test('should fail with 400 Bad Request if user id is invalid', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const userResponse = await api
        .post('/api/users/notavalidid/follow')
        .set('Authorization', token)
        .expect(400);

      expect(userResponse.body.error).toBe('malformatted id');
    });
  });

  describe('getting whotofollow', () => {
    test('should get only 3 whotofollow users ', async () => {
      const usersAtStart = await usersInDb();
      const userId = usersAtStart[0].id;

      const usersResponse = await api
        .get(`/api/users/${userId}/whotofollow`)
        .expect(200);

      expect(usersResponse.body).toHaveLength(3);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);
