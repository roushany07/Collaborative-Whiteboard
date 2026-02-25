import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/store';
import Canvas from '../components/Canvas';
import ChatPanel from '../components/ChatPanel';
import Toolbar from '../components/Toolbar';
import UsersList from '../components/UsersList';
import api from '../api/axios';

export default function WhiteboardRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/api/rooms/${roomId}`);
        setRoom(data);
      } catch (error) {
        alert('Room not found');
        navigate('/dashboard');
      }
    };

    fetchRoom();

    socket.emit('join-room', {
      roomId,
      userId: user._id,
      userName: user.name
    });

    socket.on('user-joined', ({ userName, users }) => {
      setUsers(users);
    });

    socket.on('user-left', ({ userName, users }) => {
      setUsers(users);
    });

    socket.on('load-messages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leave-room', {
        roomId,
        userId: user._id,
        userName: user.name
      });
    };
  }, [socket, user, roomId]);

  const handleSendMessage = (message) => {
    if (!socket || !message.trim()) return;

    socket.emit('chat-message', {
      roomId,
      userId: user._id,
      userName: user.name,
      message
    });
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b-2 border-gray-300 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{room.name}</h1>
            <p className="text-sm text-gray-600">Room ID: {roomId}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 bg-white border-r-2 border-gray-300">
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            socket={socket}
            roomId={roomId}
          />
        </div>

        <div className="flex-1">
          <Canvas
            socket={socket}
            roomId={roomId}
            tool={tool}
            color={color}
            brushSize={brushSize}
            canvasData={room.canvasData}
          />
        </div>

        <div className="w-80 bg-white border-l-2 border-gray-300 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <UsersList users={users} />
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
