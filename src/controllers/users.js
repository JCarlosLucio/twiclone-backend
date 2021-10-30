const router = require('express').Router();
const User = require('../models/user');
const { userExtractor } = require('../middleware');

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

router.post('/:id/follow', userExtractor, async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const userFollow = await User.findById(id);

  if (user._id.toString() === userFollow._id.toString()) {
    return res.status(403).json({ error: 'Cannot follow yourself' });
  }

  const isFollowing =
    user.following.includes(userFollow._id) &&
    userFollow.followers.includes(user._id);

  // if user is following userFollow
  if (isFollowing) {
    // Remove userFollow from user's following and user from userFollow's followers
    user.following.pull(userFollow._id);
    userFollow.followers.pull(user._id);
  } else {
    // Add userFollow to user's following and user to userFollow's followers
    user.following.push(userFollow._id);
    userFollow.followers.push(user._id);
  }

  const updatedMe = await user.save();
  const updatedUser = await userFollow.save();

  res.status(200).json({ updatedMe, updatedUser });
});

router.get('/:id/whotofollow', async (req, res) => {
  const id = req.params.id;

  // get users
  // that aren't the user (with given id)
  // that haven't been followed
  // sort from most to least followers
  // limit to three users
  const users = await User.find({ _id: { $ne: id }, followers: { $ne: id } })
    .sort({ followers: -1 })
    .limit(3);

  res.status(200).json(users);
});

module.exports = router;
