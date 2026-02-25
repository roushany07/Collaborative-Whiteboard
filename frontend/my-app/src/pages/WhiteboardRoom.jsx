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
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const [undoRedoFunctions, setUndoRedoFunctions] = useState(null);
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
        console.log('Fetching room:', roomId);
        const { data } = await api.get(`/api/rooms/${roomId}`);
        console.log('Room loaded:', data);
        setRoom(data);
      } catch (error) {
        console.error('Room error:', error);
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
      console.log('User joined:', userName);
      setUsers(users);
    });

    socket.on('user-left', ({ userName, users }) => {
      console.log('User left:', userName);
      setUsers(users);
    });

    socket.on('load-messages', (msgs) => {
      console.log('Messages loaded:', msgs.length);
      setMessages(msgs);
    });

    socket.on('chat-message', (message) => {
      console.log('New message:', message);
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

    console.log('Sending message:', message);
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

      <div className="flex-1 flex overflow-hidden bg-gray-50">
        <div className="w-16 bg-white border-r-2 border-gray-300 flex-shrink-0 overflow-y-auto">
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            socket={socket}
            roomId={roomId}
            canvasRef={canvasRef}
            currentUser={user}
            context={canvasContext}
            undoRedoFunctions={undoRedoFunctions}
          />
        </div>

        <div className="flex-1 bg-white">
          <Canvas
            ref={canvasRef}
            socket={socket}
            roomId={roomId}
            tool={tool}
            color={color}
            brushSize={brushSize}
            canvasData={room.canvasData}
            onContextReady={setCanvasContext}
            onUndoRedo={setUndoRedoFunctions}
          />
        </div>

        <div className="w-80 bg-white border-l-2 border-gray-300 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-hidden">
            <UsersList users={users} />
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user}
              socket={socket}
              roomId={roomId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
