const yup = require('yup');

const register = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required().min(4).max(128),
  }),
});

module.exports = { register };