const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db');
const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const tweetsRouter = require('./controllers/tweets');
const middleware = require('./middleware');
const { CORS_ORIGIN } = require('./utils/config');

const app = express();

/**Connect to mongoDB */
connectDB();

/** Middlewares */
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }),
);
app.use(express.json());
app.use(middleware.tokenExtractor);

/** Routes */
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);

/** Healthchecker */
app.get('/ping', (_, res) => {
  res.send('pong');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
