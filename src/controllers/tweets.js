const router = require('express').Router();
const { userExtractor, validate } = require('../middleware');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const { createTweet } = require('../validations/tweets');
const Tweet = require('../models/tweet');

router.get('/', async (req, res) => {
  const currentPage = Number(req.query.page) || 1;
  const perPage = Number(req.query.limit) || 10;

  const totalItems = await Tweet.countDocuments({});
  const lastPage = Math.ceil(totalItems / perPage) || 1;

  if (currentPage > lastPage || currentPage <= 0) {
    return res.status(404).json({ error: 'Page not found.' });
  }

  const tweets = await Tweet.find({})
    .sort({ _id: -1 })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .populate('user', {
      username: 1,
      name: 1,
    });

  res.status(200).json({ tweets, totalItems, currentPage, lastPage });
});

/**
 * multer(upload) middleware parses body and files(images) from
 * Content-Type': multipart/form-data which is needed for uploading images.
 * Since multer parses body and files, validation has to be after
 * multer middleware.
 */

router.post(
  '/',
  userExtractor,
  upload.array('images', 4),
  validate(createTweet),
  async (req, res) => {
    const user = req.user; // comes from userExtractor middleware
    const { content } = req.body; // parsed by multer
    const files = req.files; // also parsed by multer

    let images = [];

    if (files) {
      const imageFilesPromises = files.map((image) => {
        return cloudinary.uploader.upload(image.path, {
          folder: 'twiclone',
          allowed_formats: ['png', 'jpg', 'jpeg', 'gif'],
        });
      });

      const imagesResponse = await Promise.all(imageFilesPromises);

      images = imagesResponse.map((image) => {
        return { url: image.secure_url, filename: image.public_id };
      });
    }

    const newTweet = new Tweet({ content, user, images });

    const savedTweet = await newTweet.save();

    res.status(201).json(savedTweet);
  }
);

module.exports = router;
