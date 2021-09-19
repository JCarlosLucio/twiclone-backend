const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userExtractor, validate } = require('../middleware');
const { login, register } = require('../validations/auth');
const { JWT_SECRET } = require('../utils/config');
const User = require('../models/user');

router.post('/register', validate(register), async (req, res) => {
  const { name, username, email, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ name, username, email, password: passwordHash });

  const savedUser = await newUser.save();

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id,
  };

  const token = jwt.sign(userForToken, JWT_SECRET);

  res.status(200).json({ token, ...savedUser.toJSON() });
});

router.post('/login', validate(login), async (req, res) => {
  const body = req.body;

  const user = await User.findOne({ email: body.email });

  const isPasswordCorrect = !user
    ? false
    : await bcrypt.compare(body.password, user.password);

  if (!(user && isPasswordCorrect)) {
    return res.status(401).json({ error: 'incorrect email or password' });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, JWT_SECRET);

  res.status(200).json({ token, ...user.toJSON() });
});

router.get('/me', userExtractor, async (req, res) => {
  // req.user/req.token come from tokenExtractor/userExtractor middlewares
  const user = req.user.toJSON();
  const userWithToken = { token: req.token, ...user };
  res.json(userWithToken);
});

module.exports = router;
