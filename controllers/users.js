const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!password || password.length < 3) {
    return res.status(401).json({
      error: !password
        ? 'password is required'
        : 'password needs to be at least 3 characters long',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ email, password: passwordHash });

  const savedUser = await newUser.save();

  res.json(savedUser);
});

module.exports = router;
