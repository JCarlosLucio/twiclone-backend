const multer = require('multer');

const storage = multer.diskStorage({});

const fileFilter = (_req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, and .jpeg format allowed'), false);
  }
};

const maxSize = 2 * 1024 * 1024; // 2MB

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});
