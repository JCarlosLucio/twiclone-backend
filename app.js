const express = require('express');
const mongoose = require('mongoose');

const app = express();
const { MONGODB_URI } = require('./utils/config');

/**Connect to mongoDB */
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to mongoDB');
  })
  .catch((error) => {
    console.error('error connecting to mongoDB', error);
  });

app.get('/ping', (_, res) => {
  res.send('pong');
});

module.exports = app;
