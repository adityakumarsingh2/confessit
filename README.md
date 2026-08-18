# 🕵️ Anonymous Confession Wall (MERN Stack)

A complete full-stack anonymous confession platform built using the MERN stack. Users can log in with Google, post confessions anonymously, comment, react, and explore trending confessions — all while maintaining complete privacy.

[![Live Concept](https://img.shields.io/badge/Live%20Demo-justconfessit.vercel.app-blue?style=for-the-badge)](https://justconfessit.vercel.app)

---

## 📁 Repository Structure

This project is organized as a monorepo containing the frontend client and the backend server:

```
confessit/
├── client/          # Frontend client application (React + Vite)
│   ├── public/      # Static assets
│   ├── src/         # React source files (components, styles, app logical files)
│   └── package.json # Client-specific dependencies and scripts
└── server/          # Backend server API (Node.js + Express)
    ├── models/      # MongoDB Schema definitions (Mongoose)
    ├── config/      # Configuration files (Passport setup, database connection)
    ├── server.js    # Express server entry point
    └── package.json # Server-specific dependencies and scripts
```

---

## ✨ Features

- **🔐 Secure Google Authentication:** Authenticate securely using Google OAuth 2.0.
- **🎭 Complete Anonymity:** Google identity is kept hidden from public view. User display names and avatars are generated dynamically using random name and avatar APIs.
- **📝 Confessions & Timeline:** Create and view anonymous confessions in a real-time reactive global feed.
- **💬 Interactive Comments:** Discuss and engage with confessions anonymously using comments.
- **❤️ Real-time Reactions:** React (like/love/etc.) to posts instantly.
- **🔥 Trending Algorithm:** Display trending confessions automatically ranked based on active engagement (likes & comments).

---

## 🛠 Tech Stack

- **Frontend:** React.js, Vite, Axios, Tailwind CSS / Vanilla CSS, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose ODM
- **Authentication:** Passport.js, Google OAuth 2.0 Strategy

---

## 🚀 Getting Started

Follow these steps to run the application locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/confessit.git
cd confessit
```

### 2. Configure Backend Environment
Create a `.env` file inside the `server/` directory and populate it with your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_key
```

### 3. Setup and Run the Server
```bash
cd server
npm install
npm start
```
The server will start running on the port configured in `.env` (default is `http://localhost:5000`).

### 4. Setup and Run the Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open a browser and navigate to the local address displayed (usually `http://localhost:5173`).

---

## 🔒 Privacy & Architecture Design

Google integration is strictly restricted to secure authentication only. The application decouples user Google credentials from public profiles entirely.
- Email and Google IDs are never returned to client-side API requests.
- Random identities are randomly generated on the backend upon first registration.

---

## 👨‍💻 Author

- **Aditya Kumar Singh** - *B.Tech CSE, Full Stack Developer*
- Website: [adityakumarsingh.tech](https://adityakumarsingh.tech)
