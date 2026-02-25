import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useThemeStore } from "../store/store";
import { createRoom, joinRoom } from "../api/room.api";
import { LogOut, Plus, Users, Moon, Sun } from "lucide-react";

export default function Dashboard() {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  /* ---------- CREATE ROOM ---------- */
  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const room = await createRoom();
      navigate(`/room/${room.roomId}`);
    } catch (err) {
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- JOIN ROOM ---------- */
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;

    setLoading(true);
    try {
      await joinRoom(joinRoomId);
      navigate(`/room/${joinRoomId}`);
    } catch (err) {
      alert("Room not found");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* ---------- NAVBAR ---------- */}
      <nav className={`border-b ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Collaborative Whiteboard
          </h1>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme}>
              {isDark ? <Sun className="text-yellow-400" /> : <Moon />}
            </button>
            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 border rounded"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ---------- BODY ---------- */}
      <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        {/* CREATE ROOM */}
        <div className={`p-6 border rounded ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <div className="flex items-center gap-2 mb-4">
            <Plus /> <h2 className="text-lg font-bold">Create Room</h2>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            Create Room
          </button>
        </div>

        {/* JOIN ROOM */}
        <div className={`p-6 border rounded ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <div className="flex items-center gap-2 mb-4">
            <Users /> <h2 className="text-lg font-bold">Join Room</h2>
          </div>
          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white rounded"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}