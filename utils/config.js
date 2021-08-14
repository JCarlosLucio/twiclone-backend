require('dotenv').config();

const MONGODB_URI =
  process.env.NODE_ENV !== 'test'
    ? process.env.MONGODB_URI
    : process.env.TEST_MONGODB_URI;

const PORT = process.env.PORT;

module.exports = { MONGODB_URI, PORT };
