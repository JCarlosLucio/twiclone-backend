const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const productFolder = 'twiclone';
const testFolder = 'twiclone/test';
const folder = process.env.NODE_ENV !== 'test' ? productFolder : testFolder;

const cloudinaryUpload = (path) =>
  cloudinary.uploader.upload(path, {
    folder,
    allowed_formats: ['png', 'jpg', 'jpeg', 'gif'],
  });

const cloudinaryDeleteTest = () =>
  cloudinary.api.delete_resources_by_prefix(testFolder);

module.exports = { cloudinaryUpload, cloudinaryDeleteTest };
