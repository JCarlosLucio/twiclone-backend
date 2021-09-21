if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const JWT_SECRET = process.env.JWT_SECRET;

const MONGODB_URI =
  process.env.NODE_ENV !== 'test'
    ? process.env.MONGODB_URI
    : process.env.TEST_MONGODB_URI;

const PORT = process.env.PORT;

module.exports = { JWT_SECRET, MONGODB_URI, PORT };
