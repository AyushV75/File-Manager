# MERN File Manager

A full-stack file management application built using the MERN stack. The application allows authenticated users to create and manage nested folders, upload and organize files, and perform file and folder CRUD operations.

The project focuses on authentication, data isolation, nested folder structures, file management, and clean separation between frontend and backend responsibilities.

---

## Features

### Authentication & Security

- User registration
- User login
- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Persistent authentication session
- Logout functionality
- User data isolation
- Ownership validation for folders and files

### Folder Management

- Create folders
- Create nested folders
- Navigate through nested folders
- Breadcrumb navigation
- Rename folders
- Delete folders
- Delete folders containing nested folders and files
- Root-level folders supported

### File Management

- Upload files using Multer
- Store uploaded files locally
- Store file metadata in MongoDB
- Display file name
- Display file size
- Display file type
- Display upload date
- Rename files
- Delete files
- Move files between folders

### Frontend

- React.js
- React Context API
- Authentication state management
- Folder/file navigation state
- Responsive interface
- Axios API communication
- Loading and error handling

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- CORS

---

# Tech Stack

## Frontend

- React
- React Router
- Context API
- Axios
- Lucide React
- Vite

## Backend

- Node.js
- Express.js
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Multer
- CORS
- dotenv

## Database

- MongoDB Atlas
- MongoDB
- Mongoose ODM

## File Storage

Uploaded files are stored in the backend's local `uploads/` directory.

File metadata is stored in MongoDB.

---

# Project Architecture

The application follows a client-server architecture.

```text
React Frontend
      |
      | Axios + JWT
      v
Express API
      |
      v
Authentication Middleware
      |
      v
Controllers
      |
      v
Mongoose Models
      |
      v
MongoDB Atlas
