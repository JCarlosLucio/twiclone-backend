const yup = require('yup');

const register = yup.object({
  body: yup.object({
    name: yup.string().required(),
    username: yup
      .string()
      .required()
      .min(5)
      .max(15)
      .matches(
        /^[a-zA-Z0-9_]+$/,
        'username must contain only letters, numbers, underscores and no spaces'
      ),
    email: yup.string().email().required(),
    password: yup.string().required().min(4).max(128),
  }),
});

const login = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required().max(128),
  }),
});

module.exports = { login, register };
