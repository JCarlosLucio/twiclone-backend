const User = require('../models/user');

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
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = { initialTweets, usersInDb };
