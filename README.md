<<<<<<< HEAD
# week-17-project
room rental website for YZU students, staff and professors
=======
# 67 YZUers – Student Housing Platform 🏠🎓

**67 YZUers** is a student-focused housing and community platform created specifically for Yuan Ze University (YZU) students. The platform helps students easily find safe, affordable, and convenient accommodation near the YZU campus areas such as Neili, Xingren Road, and Yuandong Road.

The project is developed using the **MERN Stack** (MongoDB, Express, React, and Node.js).

---

## ✨ Main Features

- **Interactive Map Search**  
  Browse available rooms directly on a customized map around the YZU area.

- **Host Dashboard**  
  Students or landlords can register and post rental listings.

- **Precise Location Pinning**  
  Hosts can mark the exact location of their property on the map.

- **Advanced Filtering**  
  Search by budget, nearby landmarks (e.g., Neili Station), and amenities.

- **Community Chat Board**  
  A shared space for students to look for roommates, sell items, or ask questions.

- **YZU Bot Assistant**  
  An AI-style helper that recommends rooms based on user preferences.

- **Wishlist Function**  
  Save favorite listings for future reference.

- **Detailed Room Information**  
  Includes amenities (WiFi, air conditioning, etc.), landlord contact details, and deposit information.

---

## 🛠️ Technology Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Lucide React Icons

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB Atlas (Cloud)

**Authentication**
- JWT (JSON Web Tokens)
- Bcrypt

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js installed  
- Git installed  

### 1. Clone the Repository
bash
git clone https://github.com/kryy0O/67-YZUers.git
cd yzu-housing

### 2. Install Dependencies

**Backend**
bash
cd server
npm install

**Frontend**
bash
cd ../client
npm install

### 3. Start the Application

Run two terminals at the same time.

**Terminal 1 – Backend**
bash
cd server
node index.js
Wait until you see:  
✅ MongoDB Connected

**Terminal 2 – Frontend**
bash
cd client
npm run dev

Then open your browser and go to:  
http://localhost:5173

---

## 📂 Project Structure

yzu-housing/
├── client/              # React frontend
│   ├── public/          # Static assets (images, logos, backgrounds)
│   └── src/             # Main React source files
├── server/              # Node.js backend
│   ├── models/          # Database schemas
│   └── index.js         # Server entry point
└── README.md

---

## 🛡️ User Roles

- **Regular Users**  
  Can browse listings, use the chat board, and save rooms.

- **Hosts / Admins**  
  Can post new rental listings and remove existing ones.

Note: In the current version, all registered users have host permissions to encourage student-to-student sharing.

---

Developed for the **67th YZUers Community**.
>>>>>>> b2aa0f5 (Emergency Fix)
