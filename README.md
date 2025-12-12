67 YZUers - Student Housing Platform 🏠🎓67 YZUers is a dedicated housing and community platform designed exclusively for students of Yuan Ze University (YZU). It simplifies the process of finding safe, affordable, and convenient accommodation near the campus (Neili, Xingren Rd, Yuandong Rd).Built with the MERN Stack (MongoDB, Express, React, Node.js).✨ Key Features🗺️ Interactive Map Search: View available rooms directly on a custom map of the YZU surrounding area.🏠 Host Dashboard: Any student or landlord can sign up and list a room for rent.📍 Smart Location Picker: Uploaders can pin the exact location of their property on the map.🔍 Advanced Filters: Filter by budget, location (e.g., Neili Station), and amenities.💬 Community Chat Board: A built-in social space for students to find roommates, sell books, or ask questions.🤖 YZU Bot: An AI-style assistant to help users find rooms based on budget and area instantly.❤️ Wishlist: Save your favorite rooms to your profile for later.🛁 Detailed Listings: View amenities (Wifi, AC, etc.), landlord contact info (Line/Phone), and deposit details.🛠️ Tech StackFrontend: React (Vite), Tailwind CSS, Lucide React (Icons)Backend: Node.js, Express.jsDatabase: MongoDB Atlas (Cloud)Authentication: JWT (JSON Web Tokens) & Bcrypt🚀 Getting StartedFollow these instructions to run the project locally on your machine.PrerequisitesNode.js installed.Git installed.1. Clone the Repositorygit clone [https://github.com/kryy0O/67-YZUers.git](https://github.com/kryy0O/67-YZUers.git)
cd yzu-housing
2. Install DependenciesYou need to install packages for both the Client (Frontend) and Server (Backend).Server:cd server
npm install
Client:cd ../client
npm install
3. Run the ApplicationYou need to run two terminals simultaneously.Terminal 1 (Backend):cd server
node index.js
Wait for the message: ✅ MongoDB Connected to RyanBaseTerminal 2 (Frontend):cd client
npm run dev
Open your browser and navigate to: http://localhost:5173📂 Project Structureyzu-housing/
├── client/              # React Frontend
│   ├── public/          # Static images (map.png, logo.png, bg.jpg)
│   └── src/             # React Source Code (App.jsx)
├── server/              # Node.js Backend
│   ├── models/          # Database Schemas (Room.js, User.js, Post.js)
│   └── index.js         # Main Server Logic
└── README.md            # You are here
🛡️ Admin & Host AccessStandard User: Can browse rooms, chat, and save bookmarks.Host/Admin: Can upload new rooms and delete existing ones.Note: In the current version, all registered users are granted Host capabilities to foster a peer-to-peer community.📸 Screenshots(Add screenshots of your Home View, Map View, and Admin Panel here)Developed for the 67th YZUers Community.
