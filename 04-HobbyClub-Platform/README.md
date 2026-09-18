# 🎓 Campus ClubHub — Hobby Club Platform

An interactive web-based campus platform designed to connect students with college clubs, enable event discovery, and streamline RSVP registrations.

## 📌 Features

### 👨‍🎓 For Students

* **Club Directory:** Browse active clubs by category (Tech, Arts, Cultural, Sports).

* **Search & Filter:** Real-time search to find relevant clubs instantly.

* **One-Click Join Request:** Apply to join clubs directly from the web portal.

* **Event RSVP:** Register for upcoming campus workshops and fests with instant confirmation.

### 🛡️ For Club Leaders / Admins

* **Event Management:** Create and publish new events for members.

* **Member Management:** View and approve join requests.

## 🛠️ Technology Stack

This project strictly adheres to the approved **Modern Technology Stack**:

| Category | Technology Used | 
 | ----- | ----- | 
| **Frontend** | HTML5, CSS3 (Tailwind CSS via CDN), JavaScript (ES6+) | 
| **Backend** | Node.js, Express.js | 
| **Database** | MongoDB (Mongoose ORM) | 
| **Authentication** | JSON Web Tokens (JWT), bcrypt | 
| **API Architecture** | REST API | 
| **Version Control** | Git & GitHub | 
| **Testing** | Postman | 

## 📁 Project Structure

```
campus-clubhub/
│
├── public/
│   └── index.html          # Frontend UI (HTML5 + Tailwind CSS + Vanilla JS)
│
├── models/
│   ├── Club.js             # MongoDB Schema for Clubs
│   └── Event.js            # MongoDB Schema for Events
│
├── routes/
│   ├── clubRoutes.js       # REST API endpoints for Clubs
│   └── eventRoutes.js      # REST API endpoints for Events
│
├── .env                    # Environment Variables (PORT, MONGO_URI)
├── server.js               # Node.js/Express server setup
└── README.md               # Documentation

```

## 🚀 Quick Setup & Installation Guide

### Prerequisites

* [Node.js](https://nodejs.org/?utm_source=gemini) (v16 or higher)

* [MongoDB](https://www.mongodb.com/?utm_source=gemini) (Local server or MongoDB Atlas)

* Git

### Step 1: Clone the Repository

```
git clone https://github.com/your-username/campus-clubhub.git
cd campus-clubhub

```

### Step 2: Install Dependencies

```
npm install express mongoose dotenv cors bcryptjs jsonwebtoken

```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clubhub
JWT_SECRET=your_jwt_secret_key

```

### Step 4: Run the Application

Start the backend server:

```
npm start

```

Open `public/index.html` directly in your browser, or serve it using Express.

## 📡 REST API Reference

### 1. Clubs API

| Method | Endpoint | Description | 
 | ----- | ----- | ----- | 
| `GET` | `/api/clubs` | Fetch all clubs | 
| `POST` | `/api/clubs` | Create a new club | 

### 2. Events API

| Method | Endpoint | Description | 
 | ----- | ----- | ----- | 
| `GET` | `/api/events` | Fetch all upcoming events | 
| `POST` | `/api/events` | Create a new event | 
| `POST` | `/api/events/:id/rsvp` | RSVP for a specific event | 

## 📝 License

This project is open-source and built for educational purposes as part of a college course project.