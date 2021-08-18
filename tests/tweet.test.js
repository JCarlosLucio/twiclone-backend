const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');

const app = require('../app');
const { initialTweets } = require('./test_helper');
const Tweet = require('../models/tweet');
const User = require('../models/user');

const api = supertest(app);

describe('Tweets', () => {
  beforeEach(async () => {
    await Tweet.deleteMany({});
    await User.deleteMany({});

    const saltRounds = 10;
    const password = await bcrypt.hash('test', saltRounds);
    const user = new User({ email: 'test@example.com', password });
    await user.save();
    await Tweet.create(initialTweets.map((tweet) => ({ ...tweet, user })));

    // extended timeout to avoid failing tests for timeout when running beforeEach
  }, 100000);

  describe('getting tweets', () => {
    test('should return tweets as json', async () => {
      await api
        .get('/api/tweets')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    test('should return all tweets', async () => {
      const response = await api.get('/api/tweets');
      expect(response.body).toHaveLength(initialTweets.length);
    });

    test('should return tweets with user without password', async () => {
      const response = await api.get('/api/tweets');
      const userProps = response.body.flatMap((tweet) =>
        Object.keys(tweet.user)
      );
      expect(userProps).not.toContain('password');
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);
