# 🕵️ ConfessHere - Anonymous Confession Platform (MERN Stack)

**ConfessHere** is a modern, full-stack anonymous confession platform built with the MERN stack. It offers a safe space where users can log in via Google OAuth, share secrets anonymously, receive direct NGL-style messages, react with floating emoji bursts, and explore trending confessions — all with complete identity protection.

[![Live Website](https://img.shields.io/badge/Live%20Website-confesshere.online-blue?style=for-the-badge&logo=vercel)](https://www.confesshere.online)

---

## 📁 Repository Structure

```
confessit/
├── client/          # Frontend React + Vite application
│   ├── public/      # Static assets & icons
│   ├── src/         # UI Components, Canvas animations, CSS Modules
│   └── package.json # Client dependencies & scripts
└── server/          # Backend Node.js + Express API
    ├── models/      # Mongoose Schemas (Confession, User, Activity)
    ├── config/      # Passport Google OAuth & DB connection
    ├── server.js    # Express API entry point
    └── package.json # Server dependencies & scripts
```

---

## ✨ Features & User Experience

- **🔐 Google OAuth Authentication:** Seamless login while guaranteeing complete anonymity. Google IDs and emails are never exposed or stored on public posts.
- **🎭 Dynamically Generated Identities:** Anonymous usernames (e.g., *Mystic Panda*) and avatars are dynamically assigned and can be regenerated anytime with a 360° spin effect.
- **🎉 Confetti Celebrations:** Festive particle canvas explosion upon posting confessions.
- **✨ Floating Emoji Bursts:** Interactive particle burst animations when reacting with emojis (❤️, 😂, 😢, 🔥, 😮).
- **📩 Anonymous Inbox & Recipient Replies:** NGL-style custom recipient links allowing users to send direct secrets and recipients to reply privately.
- **🔖 Bookmarks & Drafts:** Save favorite secrets or draft confessions offline before sharing.
- **⏱️ Glassmorphism Toasts:** Smooth notification popups with animated countdown progress timers.
- **🔥 Engagement-driven Trends:** Real-time trending algorithm ranking posts based on live reactions and comment activity.
- **🏷️ Mood Tag Filtering:** Category tags (#Relationship, #Study, #College, #Feelings) with interactive search and filtering.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Lucide React Icons, Canvas Confetti, Vanilla CSS Glassmorphism
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose ODM
- **Authentication:** Passport.js, Google OAuth 2.0 Strategy, Express Sessions

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/adityakumarsingh2/confessit.git
cd confessit
```

### 2. Configure Backend Environment
Create a `.env` file inside `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Start the Server
```bash
cd server
npm install
npm start
```

### 4. Start the Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔒 Privacy Architecture Design

Google integration is strictly restricted to secure authentication. The platform completely decouples user Google credentials from public profiles:
- User email addresses and Google IDs are omitted from all public API endpoints.
- Anonymous personas and avatars are generated server-side upon initial sign-up and stored independently.

---

## 👨‍💻 Author

- **Aditya Kumar Singh** - *Full Stack Developer*
- Website: [adityakumarsingh.tech](https://adityakumarsingh.tech)
- Live App: [confesshere.online](https://www.confesshere.online)
