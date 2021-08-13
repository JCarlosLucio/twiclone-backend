const express = require('express');
const connectDB = require('./db');
const usersRouter = require('./controllers/users');

const app = express();

/**Connect to mongoDB */
connectDB();

app.use(express.json());

app.use('/api/users', usersRouter);

app.get('/ping', (_, res) => {
  res.send('pong');
});

module.exports = app;
