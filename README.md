# 🎥 YouTube Clone

**YouTube Clone** is a full-stack MERN (MongoDB, Express, React, Node.js) video streaming platform inspired by YouTube.  
It enables users to create channels, upload and manage videos, and explore a fully responsive media experience.  
The project focuses on a smooth, modern UI, robust backend handling, and real-time feedback using toast notifications.

## 💻 Live Demo

*To be added soon*
<!-- [Click here](https://shoppyglobe-frontend.onrender.com/) to view a live demo of **YouTube-Clone**.

> Note: Both the frontend and backend are deployed on [**Render**](https://www.render.com/), so the backend may take a few seconds to wake up on first request. -->

## 🚀 Tech Stack

### **Frontend**
- [React 19](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router DOM 7](https://reactrouter.com/)
- [Material UI (MUI)](https://mui.com/material-ui/)
- [React Hook Form](https://www.react-hook-form.com/)
- [React Hot Toast](https://react-hot-toast.com/)
- [Date-fns](https://date-fns.org/)
- [Material UI Confirm](https://github.com/jonatanklosko/material-ui-confirm)
- Core CSS & Responsive Design

### **Backend**
- [Node.js](https://nodejs.org/en)
- [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) 
- [Mongoose](https://mongoosejs.com/)
- [JWT Authentication](https://www.jwt.io/)
- [Multer + Cloudinary for image storage (multer-cloudinary-storage)](https://github.com/affanshahid/multer-storage-cloudinary)
- [BcryptJS for password hashing](https://github.com/dcodeIO/bcrypt.js)
- [Get-video-duration for media duration handling](https://github.com/caffco/get-video-duration)
- [CORS](https://github.com/expressjs/cors), [Dotenv](https://github.com/motdotla/dotenv)

## ✨ Features

- **Authentication & Authorization**
  - JWT-based login & signup
  - Persistent sessions

- **Channel Management**
  - Create and edit channels
  - Upload profile pictures & banners

- **Video Management**
  - Upload videos with thumbnails
  - Edit video details (title, description, category)
  - Delete videos

- **Video Playback**
  - Watch videos without login
  - View channel details
  - Suggested videos

- **Search**
  - Keyword-based and tags video search

- **UI & UX**
  - Category filter bar
  - Fixed header with mobile-friendly search
  - Fully responsive layout (mobile, tablet, desktop)
  - Toast notifications for actions

---

## 📂 Folder Structure

The project follows a **monorepo structure** with separate `frontend/` and `backend/` directories managed together in a single repository. The backend is organized using the **MVC (Model-View-Controller)** architectural pattern to ensure separation of concerns and scalability.

```
.
├── backend/ # Express + MongoDB (API server)
│ ├── config/ # Database connection config (MongoDB Atlas) + Multer Config
│ ├── controllers/ # Logic for handling route requests (auth, video, channel)
│ ├── models/ # Mongoose schemas for User, Video, Comment, and Channel
│ ├── routes/ # API endpoint definitions (auth, user, video, channel etc.)
│ ├── .env # Environment variables (PORT, MONGO_URI, JWT_SECRET, CLOUDINARY SECRETS)
│ ├── package.json # Backend dependencies
│ └── server.js # Entry point for the Express server
│
└── frontend/ # React client (Vite + Redux and React-router)
├── src/
│ ├── assets/ # Logos, favicon, and static media
│ ├── components/ # UI components (Header, VideoTile, Search, etc.)
│ ├── pages/ # Route-based views (Home, ManageChannel, SignUp, Login etc.)
│ ├── utils/ # Redux store & slices, API_CONFIG, Context API and utility functions
│ ├── App.jsx # App layout and routes
│ └── main.jsx # Entry point with router and Redux provider
├── package.json # Frontend dependencies
└── vite.config.js # Vite build configuration
```

---

## ⚙️ Setup & Run Locally

> Requires **[Node.js v18+](https://nodejs.org/en/download)** and an **internet connection** (obviously hahaha).

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/mdfaizan0/youtube-clone.git
cd youtube-clone
```

### Step 2: Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and add the following:

```bash
MONGO_URI="mongodb+srv://readonly-user:***REMOVED***@cluster0.s6n7lco.mongodb.net/youtube-clone"
PORT=5000
JWT_SECRET="your-jwt-secret-key"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_URL="CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<cloud-name>"
```

> You should replace all the placeholders with your own API_KEY, SECRETs and CLOUD_NAME.

 Start the backend server:

```bash
npm run dev
```

This will run the Express server on `http://localhost:5000` with [Nodemon](https://nodemon.io/), which will automatically restart if you make changes.

###  Step 3: Setup Frontend

In a new terminal window (click + icon on top-right of Terminal, if using VS Code):

```bash
cd youtube-clone
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory and add the following:

```bash
VITE_CLOUDINARY_CLOUD_NAME=dzrmcufod
VITE_CLOUDINARY_UPLOAD_PRESET=frontend_avatar_upload
VITE_CLOUDINARY_UPLOAD_PRESET_CHANNEL=frontend_channelAvatars_upload
VITE_API_URL=http://localhost:5000
```

Start the React frontend:

```bash
npm run dev
```

This will run the Vite development server on `http://localhost:5173`.

### ✅ Final Step: Test the App

Visit http://localhost:5173 in your browser. Ensure both frontend and backend are running simultaneously for full functionality.

> This project is built for academic and learning purposes only.

Thank You 💚