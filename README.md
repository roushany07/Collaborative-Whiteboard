# 🎨 Real-Time Collaborative Whiteboard

A full-stack MERN application for real-time collaborative drawing with WebSocket support, video calling, and Google OAuth authentication.

![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Express](https://img.shields.io/badge/Express-4.18-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node](https://img.shields.io/badge/Node-16+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-black)

## ✨ Features

### Core Features
- ✅ User Authentication (JWT + Google OAuth)
- ✅ Create and Join Whiteboard Rooms via unique Room ID
- ✅ Real-time drawing synchronization using Socket.io
- ✅ Canvas tools: Pencil, Eraser, Text, Clear Board
- ✅ Color picker and brush size selection
- ✅ Background color customization
- ✅ Multi-user collaboration
- ✅ Chat feature with timestamps
- ✅ Persistent storage in MongoDB Atlas
- ✅ Responsive UI with React Hooks

### Advanced Features
- ✅ Undo/Redo functionality
- ✅ Save whiteboard as image
- ✅ User presence indicator (online users)
- ✅ Protected routes
- ✅ Video calling with WebRTC
- ✅ Screen sharing
- ✅ File sharing
- ✅ Session recording
- ✅ Dark/Light mode toggle
- ✅ Image upload to canvas
- ✅ Auto-save canvas data

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Socket.io Client
- Zustand (State Management)
- Tailwind CSS
- Lucide Icons
- Axios
- WebRTC

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- Socket.io
- JWT Authentication
- Passport.js (Google OAuth)
- bcryptjs

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google OAuth credentials (optional)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/collaborative-whiteboard.git
cd collaborative-whiteboard
```

### 2. Backend Setup

```bash
cd backend/server
npm install
```

Create `.env` file in `backend/server/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend/my-app
npm install
```

Create `.env` file in `frontend/my-app/`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start frontend:
```bash
npm run dev
```

### 4. Access Application
Open browser at `http://localhost:5173`

## 🔐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env` files

## 🚀 Usage

1. **Register/Login**: Create account or use Google Sign-In
2. **Dashboard**: Create new room or join existing room with Room ID
3. **Whiteboard Features**:
   - Draw with pencil tool
   - Erase with eraser
   - Add text by clicking text tool
   - Change colors and brush size
   - Change background color
   - Undo/Redo actions
   - Clear entire canvas
   - Download as image
   - Upload images
4. **Collaboration**:
   - See online users
   - Chat with participants
   - Video call with others
   - Share screen
   - Share files
5. **Auto-save**: Canvas automatically saves every 2 seconds

## 📁 Project Structure

```
PROJECT_FINAL/
├── backend/
│   └── server/
│       ├── config/          # Database & Passport config
│       ├── controllers/     # Route controllers
│       ├── middleware/      # Auth middleware
│       ├── models/          # MongoDB models
│       ├── routes/          # API routes
│       ├── socket/          # Socket.io handlers
│       ├── utils/           # Helper functions
│       └── server.js        # Entry point
└── frontend/
    └── my-app/
        └── src/
            ├── api/         # Axios config
            ├── components/  # React components
            ├── pages/       # Page components
            ├── store/       # Zustand store
            └── App.jsx      # Main app
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Rooms
- `POST /api/rooms/create` - Create new room
- `GET /api/rooms/my-rooms` - Get user's rooms
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/save` - Save canvas data

## 🔄 Socket Events

### Client → Server
- `join-room` - Join whiteboard room
- `leave-room` - Leave room
- `draw` - Send drawing data
- `clear-canvas` - Clear canvas
- `undo` - Undo action
- `redo` - Redo action
- `chat-message` - Send message
- `video-offer` - WebRTC offer
- `video-answer` - WebRTC answer
- `ice-candidate` - ICE candidate

### Server → Client
- `user-joined` - User joined notification
- `user-left` - User left notification
- `draw` - Receive drawing data
- `clear-canvas` - Canvas cleared
- `load-canvas` - Load saved canvas
- `load-messages` - Load chat history
- `chat-message` - Receive message

## 🎯 Key Features Explained

### Real-Time Drawing
Uses Socket.io for instant synchronization of drawing actions across all connected users in the same room.

### Video Calling
Implements WebRTC peer-to-peer connections with STUN server for NAT traversal, enabling face-to-face collaboration.

### Auto-Save
Canvas data is automatically saved to MongoDB Atlas every 2 seconds after drawing stops, ensuring no work is lost.

### Undo/Redo
Maintains drawing history stack, allowing users to undo/redo actions while keeping all users synchronized.

## 🌐 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables

### MongoDB Atlas
Already configured - just update `MONGODB_URI` in production `.env`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Socket.io for real-time communication
- MongoDB Atlas for cloud database
- Google OAuth for authentication
- WebRTC for video calling
- Tailwind CSS for styling

---

⭐ Star this repo if you find it helpful!
