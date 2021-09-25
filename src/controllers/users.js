const router = require('express').Router();
const User = require('../models/user');

router.get('/', async (_req, res) => {
  const users = await User.find({});
  res.json(users);
});

router.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json(user);
});

module.exports = router;
