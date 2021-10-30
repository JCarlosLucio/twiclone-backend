const User = require('../models/user');
const Tweet = require('../models/tweet');

const initialTweets = [
  {
    content: 'First testing tweet',
  },
  {
    content: 'Another tweet for testing',
  },
  {
    content: 'Dogs are great!',
  },
  {
    content: '280 characters are too much for me',
  },
  {
    content:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi maiores natus, obcaecati sit incidunt quae. Impedit nesciunt blanditiis assumenda maiores voluptates reiciendis rerum, id harum distinctio unde, cumque neque aliquid.',
  },
  {
    content: 'Yet another testing post',
  },
  {
    content: 'Cats are great!',
  },
  {
    content: 'With limit two',
  },
  {
    content: 'This is page two',
  },
  {
    content: 'Ducks are great',
  },
  {
    content: '123123123123123123132 123123123',
  },
];

const initialReplies = Array.from({ length: 5 }, (_, i) => ({
  content: `${i + 1}`,
}));

const initialUsers = (followerId) =>
  Array.from({ length: 3 }, (_, i) => ({
    name: `Tester${i + 1}`,
    username: `tester${i + 1}`,
    email: `test${i + 1}@example.com`,
    followers: Array.from({ length: i }, () => followerId),
  }));

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const tweetsInDb = async () => {
  const tweets = await Tweet.find({});
  return tweets.map((tweet) => tweet.toJSON());
};

module.exports = {
  initialTweets,
  initialReplies,
  initialUsers,
  usersInDb,
  tweetsInDb,
};
