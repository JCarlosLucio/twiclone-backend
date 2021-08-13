const router = require('express').Router();
const Tweet = require('../models/tweet');

router.get('/', async (req, res) => {
  const tweets = await Tweet.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  res.json(tweets);
});
