# AKW-Back

This is a Node.js backend application using Express, TypeScript, and MongoDB. It includes various configurations and tools to ensure a smooth development experience and maintainable codebase.

## Features

- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **Helmet**: Helps secure Express apps by setting various HTTP headers.
- **CORS**: Middleware to enable Cross-Origin Resource Sharing.
- **Rate Limiting**: Middleware to limit repeated requests to public APIs.
- **Joi**: Schema description language and data validator for JavaScript.
- **JWT**: JSON Web Token for secure authentication.
- **Winston**: A logger for just about everything.
- **Swagger**: API documentation generator.
- **ESLint**: Pluggable linting utility for JavaScript and TypeScript.
- **Prettier**: Code formatter.
- **Jest**: JavaScript testing framework.
- **Nodemon**: Utility that monitors for changes in your source and automatically restarts your server.

## Project Structure

```
.env
.eslintignore
.eslintrc.json
.gitignore
.prettierrc
combined.log
error.log
eslint.config.mjs
jest.config.js
nodemon.json
package.json
src/
    app.ts
    config/
        database.ts
        logger.ts
        rateLimit.ts
        swagger.ts
    controllers/
    middlewares/
        errorHandler.ts
        validate.ts
    models/
    routes/
        health.ts
    server.ts
    types/
    uploads/
tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- MongoDB Atlas account

### Installation



1. Install dependencies:
```sh
npm install
```

1. Create a `.env` file in the root directory and add your MongoDB connection string and other environment variables:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/mydatabase?retryWrites=true&w=majority
PORT=3000
```

### Running the Application

Start the development server:
```sh
npm run dev
```
The server will start on the port specified in the `.env` file (default is 3000).

### Running Tests

Run the tests using Jest:
```sh
npm test
```

### Linting and Formatting

Lint the code using ESLint:
```sh
npm run lint
```

Format the code using Prettier:
```sh
npm run format
```

## API Documentation

The API documentation is generated using Swagger. You can access it at `/api-docs`:
```
http://localhost:3000/api-docs
```
