const yup = require('yup');

const createTweet = yup.object({
  body: yup.object({
    content: yup.string().required().max(280),
  }),
});

module.exports = { createTweet };
