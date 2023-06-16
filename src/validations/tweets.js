const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const createTweet = yup.object({
  body: yup.object({
    content: yup.string().trim().max(280),
    parent: yup
      .string()
      .trim()
      .nullable()
      .test('isValidObjectId', 'malformatted id', (id) =>
        !id ? true : isValidObjectId(id)
      ),
  }),
});

module.exports = { createTweet };
