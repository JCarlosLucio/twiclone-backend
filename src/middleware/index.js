const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');
const logger = require('../utils/logger');
const User = require('../models/user');

const errorHandler = (error, _req, res, next) => {
  logger.error(error);
  // console.log('From middleware>> ', JSON.stringify(error));
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ type: error?.type, error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' });
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' });
  } else if (error.name === 'MulterError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

const tokenExtractor = (req, _res, next) => {
  const authorization = req.get('authorization');

  req.token = null;

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
  }

  next();
};

const userExtractor = async (req, res, next) => {
  // req.token is added by tokenExtractor middleware
  const decodedToken = jwt.verify(req.token, JWT_SECRET);
  const user = await User.findById(decodedToken.id);

  if (!req.token || !decodedToken.id || !user) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  req.user = user;

  next();
};

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const validate = (schema) => async (req, _res, next) => {
  await schema.validate({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  next();
};

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor,
  unknownEndpoint,
  validate,
};
