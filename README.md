# Video Sharing Platform

## Overview

This project is a **secure video-sharing platform** designed to allow users to upload, view, and interact with videos. The platform supports multiple video formats and provides features such as user authentication, secure media storage, and user interactions like liking and commenting on videos.

## Problem Statement

The goal of this project was to build a video-sharing platform where users can securely upload, access, and share videos. The focus was on handling multiple users interacting with large files, ensuring secure login mechanisms, and supporting multi-format video uploads.

## Objectives

- Build a video-sharing platform for users.
- Implement secure user authentication using **JWT tokens** for access and refresh tokens.
- Support multi-format video uploads and ensure smooth playback.
- Enable user interaction features like **likes** and **comments** on videos.

## Impact

This project provided an opportunity to understand how video-sharing platforms function at scale and handle multiple user interactions with large media files. By using **Cloudinary** for media storage, **MongoDB** for metadata storage, and **Express.js** for backend logic, the platform can efficiently manage users and media securely.

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose for schema definition
- **Cloud Storage**: Cloudinary for storing and serving video files
- **Authentication**: JSON Web Tokens (JWT) for secure user login
- **Password Security**: bcrypt for hashing and securely storing passwords
- **API Testing**: Postman for testing API routes and functionality

## Features

1. **User Authentication**
   - JWT-based authentication for secure login and session management.
   - Passwords are securely hashed using **bcrypt**.

2. **Video Upload and Management**
   - Users can upload videos in multiple formats.
   - Videos are stored on **Cloudinary**, ensuring scalability and efficient content delivery.

3. **User Interaction**
   - Users can like and comment on videos.
   - Interactions are stored in MongoDB using a **NoSQL** schema for fast retrieval and efficient querying.

## Database

- **MongoDB**: A NoSQL database used for storing user information, video metadata, likes, and comments.
  - **Schemas**: Mongoose is used to define schemas for:
    - **User**: Stores user credentials and authentication tokens.
    - **Video**: Stores metadata for uploaded videos.
    - **Likes**: Tracks which users liked which videos.
    - **Comments**: Stores comments related to videos.

## Additional Technologies

- **Multer**: Used for handling video file uploads.
- **Cookie-Parser**: For managing cookies in requests and responses.
- **Cloudinary**: Provides multi-format video storage, optimization, and CDN delivery.

## Search Algorithm

The platform uses an **efficient search algorithm** to filter and retrieve videos based on search queries.

## API Documentation

The API is structured with REST principles, enabling smooth communication between the frontend and backend services. The APIs are thoroughly tested using **Postman** to ensure functionality.

## How to Run

1. Clone the repository:
    ```bash
    git clone https://github.com/stealthqueen0849/Backend.git
    cd Backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory and add the following variables:
    ```bash
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    MONGO_URI=your_mongo_uri
    JWT_SECRET=your_jwt_secret
    ```

4. Start the server:
    ```bash
    npm start
    ```

## Contributing

Feel free to open issues or submit pull requests if you find any bugs or want to add new features.
