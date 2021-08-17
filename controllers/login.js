const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_TOKEN } = require('../utils/config');
const User = require('../models/user');

router.post('/', async (req, res) => {
  const body = req.body;

  const user = User.find({ email: body.email });

  const isPasswordCorrect = await bcrypt.compare(body.password, user.password);

  if (!(user && isPasswordCorrect)) {
    return res.status(404).json({ error: 'incorrect email or password' });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, JWT_TOKEN);

  res.status(200).json({ token, username: user.username, name: user.name });
});

module.exports = router;
