const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const createTweet = yup.object({
  body: yup.object({
    content: yup.string().required().max(280),
    parent: yup
      .string()
      .nullable()
      .test('isValidObjectId', 'malformatted id', (value) =>
        isValidObjectId(value)
      ),
  }),
});

module.exports = { createTweet };
