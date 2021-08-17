const tokenExtractor = (req, _res, next) => {
  const authorization = req.get('authorization');

  req.token = null;

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
  }

  next();
};

module.exports = { tokenExtractor };
