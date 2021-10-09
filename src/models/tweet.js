const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxLength: 280,
      default: '',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
      default: null,
    },
    user: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
      },
    ],
  },
  { timestamps: true }
);

tweetSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
