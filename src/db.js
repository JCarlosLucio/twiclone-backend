const mongoose = require('mongoose');
const { MONGODB_URI } = require('./utils/config');
const logger = require('./utils/logger');

const connectDB = async () => {
  try {
    // Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false
    await mongoose.connect(MONGODB_URI);
    logger.info('connected to mongoDB');
  } catch (error) {
    logger.error('error connecting to mongoDB', error);
  }
};

module.exports = connectDB;
