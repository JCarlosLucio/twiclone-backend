# 🌪️ Twiclone Backend

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/JCarlosLucio/twiclone-backend#readme)

> The backend for Twiclone (a twitter clone)

## 📜 Docs

To run add a `.env` file with the environment variables from `.env.examples`.

### Prerequisites

- node >= 16.0

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

## 🚀 Deployment

1. Link github repo to [Render](https://render.com/).
2. Set `ROOT DIRECTORY` as `root` (default).
3. Override `BUILD COMMAND` with:

```sh
npm ci
```

4. Add `HEALTH CHECK PATH` to `/ping`.
5. Add `server environment variables` from `.env.example`.
6. Add `NODE_VERSION` with desired version (node >=16.0.0) to environment
   variables. Otherwise it defaults to `14.17.5`.

## TODO

- Add documentation for all `routes`.

## Lessons Learned

- Creating an [ExpressJS](https://expressjs.com/) server.
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
