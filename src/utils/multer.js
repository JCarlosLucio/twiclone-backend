const multer = require('multer');

const storage = multer.diskStorage({});

const fileFilter = (_req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/gif'
  ) {
    cb(null, true);
  } else {
    const error = new Error('Only .png, .jpg, .jpeg, and .gif formats allowed');
    error.name = 'MulterError';

    cb(error, false);
  }
};

const maxSize = 3 * 1024 * 1024; // 3MB

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});
