# 🌪️ Twiclone Backend

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/JCarlosLucio/twiclone-backend#readme)

> The backend for Twiclone (a twitter clone)

## 📜 Docs

To run add a `.env` file with the environment variables from `.env.examples`.

### Install

```sh
npm install
```

Installs dependencies.

### Develop

```sh
yarn run dev
```

Runs the app in development mode on
[http://localhost:3001](http://localhost:3001).

### Start

```sh
npm run start
```

Runs the app in the production mode.

### Test

```sh
npm run test
```

Runs all the tests.

## TODO

- Add documentation for all `routes`.

## Lessons Learned

- Using [MongoDB](https://www.mongodb.com/) with
  [mongoose](https://mongoosejs.com/).
- Handling authentication/authorization with [JWTs](https://jwt.io/).
- Password hashing with [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- Validating data with [yup](https://github.com/jquense/yup).
- Handling file uploads with [multer](https://github.com/expressjs/multer).
- Uploading images to [Cloudinary](https://cloudinary.com/).
- Testing with a server with [jest](https://jestjs.io/) and
  [supertest](https://github.com/ladjs/supertest).

## Author

👤 **Juan Carlos Lucio**

- Github: [@JCarlosLucio](https://github.com/JCarlosLucio)
