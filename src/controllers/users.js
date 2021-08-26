const router = require('express').Router();
const User = require('../models/user');

router.get('/', async (_req, res) => {
  const users = await User.find({});
  res.json(users);
});

router.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.json(user);
});

module.exports = router;
