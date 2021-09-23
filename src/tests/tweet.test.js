const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Buffer } = require('buffer');
const supertest = require('supertest');

const app = require('../app');
const { initialTweets, tweetsInDb } = require('./test_helper');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const { cloudinaryDeleteTest } = require('../utils/cloudinary');

const api = supertest(app);

describe('Tweets', () => {
  beforeEach(async () => {
    await Tweet.deleteMany({});
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

    test('should return default page and default limit of tweets', async () => {
      const defaultTweetsLimit = 10;
      const defaultPage = 1;
      const response = await api.get('/api/tweets');
      expect(response.body.tweets).toHaveLength(defaultTweetsLimit);
      expect(response.body.currentPage).toBe(defaultPage);
    });

    test('should return totalItems/currentPage/tweets/lastPage according to page/limit', async () => {
      const page = 2;
      const limit = 2;
      const response = await api.get(`/api/tweets?page=${page}&limit=${limit}`);

      expect(response.body.totalItems).toBe(initialTweets.length);
      expect(response.body.tweets).toHaveLength(limit);
      expect(response.body.currentPage).toBe(page);

      const expectedLastPage = Math.ceil(initialTweets.length / limit);
      expect(response.body.lastPage).toBe(expectedLastPage);

      const contents = response.body.tweets.map((tweet) => tweet.content);
      const tweet1 = initialTweets[7].content;
      const tweet2 = initialTweets[8].content;
      expect(contents).toContain(tweet1);
      expect(contents).toContain(tweet2);
    });

    test('should fail with 404 Not Found if page not found', async () => {
      const page = 3;
      const limit = 11;
      const response = await api
        .get(`/api/tweets?page=${page}&limit=${limit}`)
        .expect(404);
      expect(response.body.error).toBe('Page not found.');
    });

    test('should return tweets with user without password', async () => {
      const response = await api.get('/api/tweets');
      const userProps = response.body.tweets.flatMap((tweet) =>
        Object.keys(tweet.user)
      );
      expect(userProps).not.toContain('password');
    });
  });

  describe('creating tweets', () => {
    test('should add a tweet without images', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const newTweet = {
        content: 'Creating a tweet from a test',
      };

      await api
        .post('/api/tweets')
        .set('Authorization', token)
        .field('content', newTweet.content)
        .expect(201);

      const tweetsAfter = await tweetsInDb();
      const contents = tweetsAfter.map((tweet) => tweet.content);

      expect(tweetsAfter).toHaveLength(initialTweets.length + 1);
      expect(contents).toContain(newTweet.content);
    });

    test('should add a tweet with image', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const content = 'Creating a tweet with image from a test';
      const file = `${__dirname}/testFiles/test.jpg`;

      const tweetResponse = await api
        .post('/api/tweets')
        .set('Authorization', token)
        .field('content', content)
        .attach('images', file)
        .expect(201);

      const tweetsAfter = await tweetsInDb();
      const contents = tweetsAfter.map((tweet) => tweet.content);

      expect(tweetsAfter).toHaveLength(initialTweets.length + 1);
      expect(contents).toContain(content);
      expect(tweetResponse.body.images).toHaveLength(1);
    });

    test('should fail with 400 Bad Request if image too large', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const content = 'A tweet with a file too large';

      // A buffer is used to mock the image
      const largeBuffer = Buffer.from('a'.repeat(4 * 1024 * 1024)); // 4MB

      const tweetResponse = await api
        .post('/api/tweets')
        .set('Authorization', token)
        .field('content', content)
        .attach('images', largeBuffer, 'test.png')
        .expect(400);

      expect(tweetResponse.body.error).toBe('File too large');
    });

    test('should fail with 400 Bad Request if type not jpg/jped/png/gif', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const content = 'A tweet with a file too large';

      // A buffer is used to mock the image
      const buffer = Buffer.from('a'.repeat(100));

      const tweetResponse = await api
        .post('/api/tweets')
        .set('Authorization', token)
        .field('content', content)
        .attach('images', buffer, 'test.txt')
        .expect(400);

      expect(tweetResponse.body.error).toBe(
        'Only .png, .jpg, .jpeg, and .gif formats allowed'
      );
    });

    test('should fail with 400 Bad Request if more than 4 images', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const content = 'A tweet with a file too large';

      // A buffer is used to mock the image
      const buffer = Buffer.from('a'.repeat(10));

      const tweetResponse = await api
        .post('/api/tweets')
        .set('Authorization', token)
        .field('content', content)
        .attach('images', buffer, 'test1.jpeg')
        .attach('images', buffer, 'test2.jpg')
        .attach('images', buffer, 'test3.png')
        .attach('images', buffer, 'test4.gif')
        .attach('images', buffer, 'test5.jpg')
        .expect(400);

      expect(tweetResponse.body.error).toBe('Unexpected field');
    });

    test('should fail with 400 Bad Request if content is missing', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const tweetResponse = await api
        .post('/api/tweets')
        .set('Authorization', token)
        .expect(400);
      expect(tweetResponse.body.error).toBe('body.content is a required field');
    });

    test('should fail with 400 Bad Request if content is too long', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const newTweet = {
        content:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde voluptatum voluptate velit mollitia harum nulla eum sint, iusto veritatis optio. Dolorem at enim perferendis dolorum totam nesciunt, aut quisquam quibusdam vero, non iure recusandae magni quam suscipit illum optio quidem, rerum sapiente!',
      };

      const tweetResponse = await api
        .post('/api/tweets')
        .set('Authorization', token)
        .field('content', newTweet.content)
        .expect(400);

      expect(tweetResponse.body.error).toBe(
        'body.content must be at most 280 characters'
      );
    });
  });

  describe('liking tweets', () => {
    test("should like a tweet if user hasn't liked it", async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const tweetsAtStart = await tweetsInDb();
      const tweetToLike = tweetsAtStart[0];

      await api
        .put(`/api/tweets/${tweetToLike.id}/like`)
        .set('Authorization', token)
        .expect(200);

      const tweetsAtEnd = await tweetsInDb();
      expect(tweetsAtEnd[0].likes).toHaveLength(tweetToLike.likes.length + 1);
      expect(tweetsAtEnd[0].likes[0].toString()).toBe(response.body.id);
    });

    test('should unlike a tweet if user has liked it', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const tweetsAtStart = await tweetsInDb();
      const tweetToLike = tweetsAtStart[0];

      await api
        .put(`/api/tweets/${tweetToLike.id}/like`)
        .set('Authorization', token)
        .expect(200);

      const tweetsAfterLike = await tweetsInDb();
      expect(tweetsAfterLike[0].likes).toHaveLength(
        tweetToLike.likes.length + 1
      );

      await api
        .put(`/api/tweets/${tweetToLike.id}/like`)
        .set('Authorization', token)
        .expect(200);

      const tweetsAtEnd = await tweetsInDb();
      expect(tweetsAtEnd[0].likes).toHaveLength(0);
    });

    test('should fail with 400 Bad Request if tweet id is invalid', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const tweetResponse = await api
        .put('/api/tweets/notavalidid/like')
        .set('Authorization', token)
        .expect(400);

      expect(tweetResponse.body.error).toBe('malformatted id');
    });

    test('should fail with 404 Not Found if tweet id is wrong', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' });

      const token = `Bearer ${response.body.token}`;

      const tweetResponse = await api
        .put('/api/tweets/123bf5e123ca762cb12e123d/like')
        .set('Authorization', token)
        .expect(404);

      expect(tweetResponse.body.error).toBe('Tweet not found.');
    });
  });
});

afterAll(() => {
  cloudinaryDeleteTest();
  mongoose.connection.close();
  // extended timeout to avoid "Jest did not exit one second after the test run has completed" warning (although it still may show warning sometimes)
}, 100000);
