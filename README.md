# MERN File Manager

A full-stack file management application built with the MERN stack. The project supports user authentication, nested folders, file uploads and organization, file movement, user data isolation, and an admin portal for managing and monitoring user data.

## Features

### Authentication & Security
- User signup and login
- Password hashing with bcrypt
- JWT-based authentication
- Persistent login using JWT
- Protected API routes
- Role-based access control with `user` and `admin` roles
- Admin-only backend routes
- User data isolation
- Ownership checks for folders and files
- Unauthorized requests return appropriate `401`/`403` responses

### Folder Management
- Create folders
- Create nested folders
- Open and navigate folders
- Breadcrumb navigation
- Rename folders
- Delete folders
- Handle nested folders and their contents when deleting

Folders use a parent-reference structure:

```text
Home
└── College
    └── Projects
        └── MERN
```

### File Management
- Upload files using Multer
- Store uploaded files locally
- Store file metadata in MongoDB
- Display:
  - File name
  - File size
  - File type
  - Upload date
- Rename files
- Delete files
- Move files between folders
- Move files to the root

### Admin Portal
- Admin-only dashboard
- View all registered users
- View folders and files
- Select a user and browse their root contents
- Navigate nested folders
- Breadcrumb navigation
- Move files within a user's folders
- Move files between different users
- Move files to a user's root
- Automatic dashboard updates using background polling

The admin dashboard refreshes its data in the background without reloading the page.

### React State Management
The frontend uses React Context API for global application state:

- `AuthContext` — authentication and user state
- `FileManagerContext` — folder/file state and file-manager operations

## Tech Stack

### Frontend
- React
- JavaScript
- JSX
- CSS
- React Router
- Context API
- Vite
- Lucide React

### Backend
- Node.js
- Express.js
- JavaScript
- JWT
- bcryptjs
- Multer

### Database
- MongoDB
- Mongoose

### Monitoring
- Vercel Speed Insights

## Project Structure

```text
file-manager/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── BreadCrumbs.jsx
│   │   │   ├── CreateFolderModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RenameModal.jsx
│   │   │   └── UploadFile.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── FileManagerContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FileManager.jsx
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── server/
    ├── config/
    │   ├── db.js
    │   └── multer.js
    │
    ├── controllers/
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── fileController.js
    │   ├── folderController.js
    │   └── userController.js
    │
    ├── middleware/
    │   ├── adminMiddleware.js
    │   └── authMiddleware.js
    │
    ├── models/
    │   ├── File.js
    │   ├── Folder.js
    │   └── User.js
    │
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── fileRoutes.js
    │   └── folderRoutes.js
    │
    ├── uploads/
    ├── .env
    ├── package.json
    └── server.js
```

## Architecture

The application follows a separated frontend/backend architecture.

```text
React Frontend
      ↓
Context API
      ↓
API Request
      ↓
Express Route
      ↓
Authentication Middleware
      ↓
Admin Middleware (admin routes only)
      ↓
Controller
      ↓
Mongoose Model
      ↓
MongoDB
```

## Authentication Flow

### Signup

```text
User enters email/password
        ↓
POST /api/auth/register
        ↓
Validate user
        ↓
bcrypt hashes password
        ↓
User saved in MongoDB
        ↓
JWT generated
        ↓
Token returned to frontend
```

### Login

```text
Email + password
        ↓
POST /api/auth/login
        ↓
Find user
        ↓
bcrypt.compare()
        ↓
Generate JWT
        ↓
Return user + role + token
```

The frontend redirects according to the user's role:

```text
Admin user → /admin
Normal user → /app
```

### Protected Request

```text
JWT
 ↓
authMiddleware
 ↓
jwt.verify()
 ↓
req.user
 ↓
Controller
```

Admin routes add an additional authorization layer:

```text
JWT
 ↓
protect
 ↓
adminMiddleware
 ↓
Admin Controller
```

## Data Model

### User

```text
User
├── email
├── password
├── role
├── createdAt
└── updatedAt
```

Roles:

```text
user
admin
```

Passwords are stored as bcrypt hashes rather than plain text.

### Folder

```text
Folder
├── name
├── owner
├── parentFolder
├── createdAt
└── updatedAt
```

`owner` identifies the user who owns the folder.

`parentFolder` identifies the folder that contains it.

A root folder has:

```text
parentFolder = null
```

### File

```text
File
├── name
├── owner
├── folder
├── size
├── mimetype
├── path
├── createdAt
└── updatedAt
```

The actual uploaded file is stored in the local `server/uploads` directory while MongoDB stores its metadata.

## Data Isolation

Every protected folder/file operation verifies ownership using the authenticated user's ID.

The backend follows the principle:

```text
JWT
 ↓
req.user._id
 ↓
resource ID + owner
 ↓
database operation
```

For example, protected operations should query using both the resource ID and authenticated owner rather than trusting an owner ID supplied by the frontend.

This prevents one user from accessing another user's folders or files.

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Folders

```text
POST   /api/folder
GET    /api/folder
PUT    /api/folder
DELETE /api/folder
```

### Files

```text
POST   /api/file/upload
GET    /api/file
PUT    /api/file
DELETE /api/file
PUT    /api/file/:id/move
```

### Admin

```text
GET /api/admin/users
GET /api/admin/folders
GET /api/admin/files
PUT /api/admin/files/:fileId/move
```

All admin endpoints require both authentication and admin authorization.

## Admin File Movement

The Admin Portal supports moving a file between users.

The flow is:

```text
Select file
    ↓
Select destination user
    ↓
Browse destination user's folders
    ↓
Select destination folder
    ↓
Click "Move Here"
    ↓
Backend verifies destination user/folder
    ↓
File owner/folder updated
```

The destination folder must belong to the selected destination user.

## Background Polling

The Admin Dashboard uses background polling to keep dashboard data current.

Every five seconds it requests:

```text
GET /api/admin/users
GET /api/admin/folders
GET /api/admin/files
```

The page itself is not reloaded.

```text
Every 5 seconds
      ↓
Fetch latest admin data
      ↓
Update React state
      ↓
Dashboard re-renders
```

This allows newly created users, folders, and files to appear on the Admin Dashboard without manually refreshing the browser.

## File Upload Flow

```text
User selects file
        ↓
UploadFile component
        ↓
FormData
        ↓
POST /api/file/upload
        ↓
Multer
        ↓
File saved to server/uploads
        ↓
File metadata saved in MongoDB
        ↓
Response returned
        ↓
React state updated
```

## Local Development Setup

### Prerequisites

Install:

- Node.js
- npm
- MongoDB

### 1. Clone the repository

```bash
git clone <repository-url>
cd file-manager
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create:

```text
server/.env
```

Use the environment variable names expected by the backend configuration, for example:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

Do not commit `.env` to Git.

### 4. Start the backend

From the `server` directory:

```bash
npm run dev
```

or use the start script defined in `server/package.json`.

The backend runs on the configured port, normally:

```text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Vite will provide the local frontend URL, normally:

```text
http://localhost:5173
```

## Environment Variables

Backend configuration should contain the values required by the server:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

If frontend API configuration is environment-based, configure the corresponding Vite variable in `client/.env`.

Never commit real credentials or secrets.

## Testing Checklist

### Authentication

- [ ] Register a new user
- [ ] Login
- [ ] Logout
- [ ] Login again
- [ ] Refresh page while authenticated
- [ ] Invalid password is rejected
- [ ] Missing JWT returns `401`
- [ ] Invalid JWT returns `401`

### Folders

- [ ] Create root folder
- [ ] Create nested folder
- [ ] Navigate folders
- [ ] Breadcrumb navigation
- [ ] Rename folder
- [ ] Delete folder
- [ ] Delete folder containing nested folders/files

### Files

- [ ] Upload file
- [ ] Display file name
- [ ] Display size
- [ ] Display type
- [ ] Display date
- [ ] Rename file
- [ ] Delete file
- [ ] Move file
- [ ] Move file to root

### Data Isolation

- [ ] User A cannot see User B's folders
- [ ] User A cannot see User B's files
- [ ] User A cannot modify User B's folders
- [ ] User A cannot modify User B's files
- [ ] User A cannot move a file into User B's folder

### Admin

- [ ] Admin login redirects to `/admin`
- [ ] Normal user login redirects to `/app`
- [ ] Normal user cannot access `/admin`
- [ ] Unauthenticated user cannot access `/admin`
- [ ] Admin can view users
- [ ] Admin can browse user folders
- [ ] Admin can browse nested folders
- [ ] Admin can move files
- [ ] Admin can move files between users
- [ ] Admin can move files to root
- [ ] Dashboard updates without a page reload

## Security Notes

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Protected API routes use authentication middleware.
- Admin API routes use admin authorization middleware.
- Resource ownership is checked on the backend.
- The frontend does not determine whether a user is authorized to perform an operation.
- Secrets are stored in environment variables and should not be committed to Git.
- Sensitive backend errors should not be exposed directly to clients.

## Important Design Decisions

### React Context API

Context API is used instead of passing authentication and file-manager state through many component levels.

### Parent Folder References

Folders use `parentFolder` references instead of storing the entire hierarchy inside one MongoDB document.

This makes nested navigation and folder queries straightforward.

### Local File Storage

Multer stores uploaded files locally in the server's `uploads` directory for the MVP.

### Role-Based Authorization

The application distinguishes between normal users and administrators.

Frontend routing improves user experience, while backend middleware enforces authorization.

### Background Polling

The Admin Dashboard polls the backend every five seconds so new users, folders, and files can appear without requiring a full page reload.

## Future Improvements

The current project focuses on the required MVP functionality. Possible future improvements could include:

- Cloud file storage
- Automated cleanup of orphaned files when users are deleted
- More advanced automated testing
- File previews/download management
- Search and filtering
- Pagination for large datasets

These are not required for the current MVP unless specifically requested by the assessment.

## Author

Ayush Vekariya

GitHub: https://github.com/AyushV75
