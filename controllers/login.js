const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');
const User = require('../models/user');

router.post('/', async (req, res) => {
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
