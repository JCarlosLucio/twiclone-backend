const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validate } = require('../middleware');
const { register } = require('../validations/auth');
const { JWT_SECRET } = require('../utils/config');
const User = require('../models/user');

router.post('/register', validate(register), async (req, res) => {
  const { email, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ email, password: passwordHash });

  const savedUser = await newUser.save();

  res.json(savedUser);
});

router.post('/login', async (req, res) => {
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

  res.status(200).json({ token, username: user.username, name: user.name });
});

module.exports = router;
