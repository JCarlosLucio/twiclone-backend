const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      minLength: 5,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 50,
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 160,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxLength: 30,
      default: '',
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      filename: {
        type: String,
        default: null,
      },
    },
    banner: {
      url: {
        type: String,
        default: null,
      },
      filename: {
        type: String,
        default: null,
      },
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
