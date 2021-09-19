const router = require('express').Router();
const { userExtractor, validate } = require('../middleware');
const { createTweet } = require('../validations/tweets');
const Tweet = require('../models/tweet');

router.get('/', async (req, res) => {
  const currentPage = Number(req.query.page) || 1;
  const perPage = 10;

  const totalItems = await Tweet.countDocuments({});
  const lastPage = Math.ceil(totalItems / perPage);

  const tweets = await Tweet.find({})
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
