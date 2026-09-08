# Video Streaming API

A work-in-progress backend for a video streaming application, built with Node.js, Express, MongoDB, and Mongoose.

The project is currently focused on establishing the backend foundation: database connectivity, user routes, authentication utilities, media upload support, and a clean application structure.

## Current Status

The application currently provides:

- Express server setup
- MongoDB connection through Mongoose
- CORS, JSON, URL-encoded body, cookie, and static-file middleware
- User route mounting under `/api/v1/users`
- Initial user and video model structure
- Multer and Cloudinary dependencies for media uploads
- Authentication dependencies for password hashing and JSON Web Tokens
- Async handler, API error, and API response utilities

User registration and login are currently placeholders and are still being implemented.

## Tech Stack

- Node.js
- Express 5
- MongoDB and Mongoose
- Multer
- Cloudinary
- bcrypt
- JSON Web Token
- Nodemon

## Project Structure

```text
src/
├── controllers/     Request handlers
├── db/              MongoDB connection
├── middlewares/     Reusable request middleware
├── models/          Mongoose schemas and models
├── routes/          API route definitions
├── utils/           Shared helpers and integrations
├── app.js           Express application configuration
├── constant.js      Application constants
└── index.js         Server entry point
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A running MongoDB instance or MongoDB Atlas connection

### Installation

```bash
git clone <repository-url>
cd prod-code
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=replace-with-a-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace-with-a-secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

The database name is configured as `video-streaming-app` in `src/constant.js`.

Do not commit `.env` or real credentials to the repository.

### Run the Development Server

```bash
npm run dev
```

The server starts after a successful MongoDB connection and listens on the port configured by `PORT`.

## API Routes

The current user route prefix is:

```text
/api/v1/users
```

Available route placeholders:

| Method | Endpoint | Status |
| --- | --- | --- |
| POST | `/api/v1/users/register` | Under development |
| POST | `/api/v1/users/login` | Under development |

## Development Roadmap

- Complete user registration validation
- Hash and verify passwords correctly
- Finish login and token generation
- Add avatar and cover-image upload flows
- Add authentication middleware
- Implement video creation and retrieval endpoints
- Add centralized error handling to the application
- Add automated tests

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server with Nodemon |
| `npm test` | Test command placeholder |
