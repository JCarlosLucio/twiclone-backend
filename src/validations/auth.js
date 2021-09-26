const yup = require('yup');
const User = require('../models/user');

const register = yup.object({
  body: yup.object({
    name: yup.string().required().max(50),
    username: yup
      .string()
      .required()
      .min(5)
      .max(15)
      .matches(
        /^[a-zA-Z0-9_]+$/,
        'username must contain only letters, numbers, underscores and no spaces'
      )
      .test(
        'uniqueUsername',
        'username has already been taken.',
        async (value) => {
          const user = await User.findOne({ username: value });
          return !user;
        }
      ),
    email: yup
      .string()
      .email()
      .required()
      .test('uniqueEmail', 'email has already been taken.', async (value) => {
        const user = await User.findOne({ email: value });
        return !user;
      }),
    password: yup.string().required().min(4).max(128),
  }),
});

const login = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required().max(128),
  }),
});

const updateMe = yup.object({
  body: yup.object({
    name: yup.string().required().max(50),
    bio: yup.string().max(160),
    location: yup.string().max(30),
  }),
});

module.exports = { login, register, updateMe };
