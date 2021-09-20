const router = require('express').Router();
const { userExtractor, validate } = require('../middleware');
const { createTweet } = require('../validations/tweets');
const Tweet = require('../models/tweet');

router.get('/', async (req, res) => {
  const currentPage = Number(req.query.page) || 1;
  const perPage = Number(req.query.limit) || 10;

  const totalItems = await Tweet.countDocuments({});
  const lastPage = Math.ceil(totalItems / perPage);

  if (currentPage > lastPage || currentPage <= 0) {
    return res.status(404).json({ error: 'Page not found.' });
  }

  const tweets = await Tweet.find({})
    .sort({ _id: -1 })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .populate('user', {
      username: 1,
      name: 1,
    });

  res.status(200).json({ tweets, totalItems, currentPage, lastPage });
});

router.post('/', userExtractor, validate(createTweet), async (req, res) => {
  const user = req.user; // comes from userExtractor middleware
  const { content } = req.body;

  const newTweet = new Tweet({ content, user });

  const savedTweet = await newTweet.save();

  res.status(201).json(savedTweet);
});

module.exports = router;
