import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/store';
import api from '../api/axios';
import { LogOut, Plus, Users, Moon, Sun } from 'lucide-react';

export default function Dashboard() {
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (token) {
      fetchRecentRooms();
    }
  }, [token]);

  const fetchRecentRooms = async () => {
    try {
      const { data } = await api.get('/api/rooms/my-rooms');
      setRecentRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/api/rooms/create', { name: roomName });
      navigate(`/room/${data.roomId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;

    setLoading(true);
    try {
      await api.post(`/api/rooms/${joinRoomId}/join`);
      navigate(`/room/${joinRoomId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`border-b-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Collaborative Whiteboard
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg border-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Plus className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create Room
              </h2>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <input
                type="text"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border-2 border-gray-900 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                Create Room
              </button>
            </form>
          </div>

          <div className={`p-6 rounded-lg border-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Users className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Join Room
              </h2>
            </div>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                placeholder="Enter room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border-2 border-green-700 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Sessions
          </h2>
          {recentRooms.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No recent sessions. Create or join a room to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {recentRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => navigate(`/room/${room.roomId}`)}
                  className={`p-4 border-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                    isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {room.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Room ID: {room.roomId}
                      </p>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(room.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
