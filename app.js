const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./utils/config');
const logger = require('./utils/logger');
const usersRouter = require('./controllers/users');

const app = express();

/**Connect to mongoDB */
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info('connected to mongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to mongoDB', error);
  });

app.use(express.json());

app.use('/api/users', usersRouter);

app.get('/ping', (_, res) => {
  res.send('pong');
});

module.exports = app;
