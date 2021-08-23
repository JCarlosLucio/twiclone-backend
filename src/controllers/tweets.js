const router = require('express').Router();
const { userExtractor } = require('../middleware');
const Tweet = require('../models/tweet');

router.get('/', async (_req, res) => {
  const tweets = await Tweet.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  res.json(tweets);
});

router.post('/', userExtractor, async (req, res) => {
  const user = req.user; // comes from userExtractor middleware
  const { content } = req.body;

  const newTweet = new Tweet({ content, user });

  const savedTweet = await newTweet.save();

  res.status(201).json(savedTweet);
});

module.exports = router;
