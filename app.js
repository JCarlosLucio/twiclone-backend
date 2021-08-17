const express = require('express');
const connectDB = require('./db');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const middleware = require('./middleware');

const app = express();

/**Connect to mongoDB */
connectDB();

/** Middlewares */
app.use(express.json());
app.use(middleware.tokenExtractor);

/** Routes */
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

/** Healthchecker */
app.get('/ping', (_, res) => {
  res.send('pong');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
